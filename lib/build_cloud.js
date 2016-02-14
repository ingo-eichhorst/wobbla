'use strict';

// export the buildCloud function
module.exports = function (channels, offset, outputMode, callback) {
  
  var config = require('../config/config.js');
  var globalCloud = require('../utils/global_cloud.js');

  var prepareSubString = function (subObj, offset) {
    var now = new Date().getTime() - config.startTime;
    var videoPos = 60 * offset * 1000;

    var subString = "";

    for (var i = 0; i < subObj.length; i++) {
      if (subObj[i].startTime > now && subObj[i].startTime < videoPos + now) {
        /** 
         * Remove new line and change unwanted signs to spaces
         * to avoid that "(Something)" != "Something"
         */
        var sub = subObj[i].text.replace('\n', ' ');
        sub = sub.replace('...', ' ');
        sub = sub.replace(/[.:\\-\\!?(),"]/g, ' ');

        /** 
         * Multiply the currently occuring words to raise theyr importance
         * (-0 to -1 Minute * 5), (-1 to -2 Minute * 4) ... (-4 to -5 Minute * 1)
         */
        var multiplier = Math.ceil(((subObj[i].startTime + now) / (now + videoPos))*5);
        for (var j = 0; j < multiplier; j++) {
          subString += sub;
        }
      }
    }
    return subString;
  };


  var wordCount = function (subtitleString) {
    var bullshit = require('../utils/bullshit.js');
    var wordCounts = {};
    subtitleString.split(" ").forEach(function(el,pos,arr){
      // filter bullshit words
      if (bullshit.indexOf(el.toLowerCase()) < 0) {
        wordCounts[el] = wordCounts[el] ? ++wordCounts[el] : 1;
      }
    });
    return wordCounts;
  };

  var cloudArray = [];
  for (var i = 0; i < channels.length; i++) {
    // preparing subtitle objects of the channels to get a processable string 
    var subString = prepareSubString(channels[i].subObj, config.offset);

    // create an onject with the number of words occurance and filter unwanted words
    var cloudObj = wordCount(subString);

    // Build an Array out of the cloudObject with the related channels
    for (var key in cloudObj) {
      var occ = false;
      for (var j = 0; j < cloudArray.length; j++) {
        if (cloudArray[j].text == key) {
          cloudArray[j].size += cloudObj[key];
          cloudArray[j].channels.push({
            name: channels[i].name,
            url: channels[i].url,
            chName: channels[i].chName
          });
          var occ = true;
        };
      };
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
   * get rid of the words that are no occuring 
   * 2 (or another config value) amount of times
   */
  var reducedArray = [];
  for (i = 0; i < cloudArray.length; i++) {
    if (cloudArray[i].size >= config.wordMinOccurrence) {
      reducedArray.push(cloudArray[i]);
    };
  };

  var cloud = reducedArray;
  // sort the array by size of it's members
  function compareSize(a,b) {
    if (a.size > b.size) {return -1;}
    else if (a.size < b.size) {return 1;}
    else {return 0;}
  }
  cloud.sort(compareSize);

  // take only the top configurated (default: 50) entries
  cloud = cloud.slice(0,config.cloudMaxEntries);

  // if output mode is set to static leave the words at the same position
  if (outputMode == 'static') {
    /**
     * if a word is already in the cloud-array of words
     * make sure it is not simply rearranged to another position
     * but sticks to the same position as long as it's in the top
     */
    var notMatchArray = [];
    var occ = false;
    for (i = 0; i < cloud.length; i++) {
      occ = false;
      for (j = 0; j < globalCloud.length; j++) {
        if (cloud[i] && cloud[i].text == globalCloud[j].text) {
          globalCloud[j].size = cloud[i].size;
          globalCloud[j].channels = cloud[i].channels;
          occ = true;
        }
      }
      if (!occ) {
        notMatchArray.push(i);
      }
    }

    for (i = 0; i < notMatchArray.length; i++) {
      if (notMatchArray.indexOf(i) > -1) {
        globalCloud[notMatchArray[i]] = cloud[i];
        console.log(cloud[i].text);
      }
    }
    cloud = globalCloud;
  }
  else if (outputMode != 'desc') {
    return callback('undefined output mode');
  }

  return callback(null, cloud);
  
}