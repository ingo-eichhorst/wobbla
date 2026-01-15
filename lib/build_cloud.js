'use strict';

// export the buildCloud function
module.exports = function (channels, offset, outputMode, callback) {

  const config = require('../config/config.js');
  const globalCloud = require('../utils/global_cloud.js');

  const prepareSubString = (subObj, offset) => {
    const now = new Date().getTime() - config.startTime;
    const videoPos = 60 * offset * 1000;

    let subString = "";

    for (let i = 0; i < subObj.length; i++) {
      if (subObj[i].startTime > now && subObj[i].startTime < videoPos + now) {
        /**
         * Remove new line and change unwanted signs to spaces
         * to avoid that "(Something)" != "Something"
         */
        let sub = subObj[i].text.replace('\n', ' ');
        sub = sub.replace('...', ' ');
        sub = sub.replace(/[.:\\-\\!?(),"]/g, ' ');

        /**
         * Multiply the currently occurring words to raise their importance
         * (-0 to -1 Minute * 5), (-1 to -2 Minute * 4) ... (-4 to -5 Minute * 1)
         */
        const multiplier = Math.ceil(((subObj[i].startTime + now) / (now + videoPos))*5);
        for (let j = 0; j < multiplier; j++) {
          subString += sub;
        }
      }
    }
    return subString;
  };


  const wordCount = (subtitleString) => {
    const bullshit = require('../utils/bullshit.js');
    const wordCounts = {};
    subtitleString.split(" ").forEach((el) => {
      // filter bullshit words
      if (bullshit.indexOf(el.toLowerCase()) < 0) {
        wordCounts[el] = wordCounts[el] ? ++wordCounts[el] : 1;
      }
    });
    return wordCounts;
  };

  const cloudArray = [];
  for (let i = 0; i < channels.length; i++) {
    // preparing subtitle objects of the channels to get a processable string
    const subString = prepareSubString(channels[i].subObj, config.offset);

    // create an object with the number of words occurrence and filter unwanted words
    const cloudObj = wordCount(subString);

    // Build an Array out of the cloudObject with the related channels
    for (const key in cloudObj) {
      let occ = false;
      for (let j = 0; j < cloudArray.length; j++) {
        if (cloudArray[j].text === key) {
          cloudArray[j].size += cloudObj[key];
          cloudArray[j].channels.push({
            name: channels[i].name,
            url: channels[i].url,
            chName: channels[i].chName
          });
          occ = true;
        }
      }
      if (!occ) {
        cloudArray.push({
          text: key,
          size: cloudObj[key],
          channels: [{
            name: channels[i].name,
            url: channels[i].url,
            chName: channels[i].chName
          }]
        });
      }
    }
  }

  /**
   * get rid of the words that are not occurring
   * 2 (or another config value) amount of times
   */
  const reducedArray = [];
  for (let i = 0; i < cloudArray.length; i++) {
    if (cloudArray[i].size >= config.wordMinOccurrence) {
      reducedArray.push(cloudArray[i]);
    }
  }

  let cloud = reducedArray;
  // sort the array by size of its members
  const compareSize = (a, b) => {
    if (a.size > b.size) return -1;
    if (a.size < b.size) return 1;
    return 0;
  };
  cloud.sort(compareSize);

  // take only the top configured (default: 50) entries
  cloud = cloud.slice(0, config.cloudMaxEntries);

  // if output mode is set to static leave the words at the same position
  if (outputMode === 'static') {
    /**
     * if a word is already in the cloud-array of words
     * make sure it is not simply rearranged to another position
     * but sticks to the same position as long as it's in the top
     */
    const notMatchArray = [];
    for (let i = 0; i < cloud.length; i++) {
      let occ = false;
      for (let j = 0; j < globalCloud.length; j++) {
        if (cloud[i] && cloud[i].text === globalCloud[j].text) {
          globalCloud[j].size = cloud[i].size;
          globalCloud[j].channels = cloud[i].channels;
          occ = true;
        }
      }
      if (!occ) {
        notMatchArray.push(i);
      }
    }

    for (let i = 0; i < notMatchArray.length; i++) {
      if (notMatchArray.indexOf(i) > -1) {
        globalCloud[notMatchArray[i]] = cloud[i];
        console.log(cloud[i].text);
      }
    }
    cloud = globalCloud;
  }
  else if (outputMode !== 'desc') {
    return callback('undefined output mode');
  }

  return callback(null, cloud);

};
