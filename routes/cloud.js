'use strict';

module.exports = function(app) {

  const config = require('../config/config.js');
  const buildCloud = require('../lib/build_cloud.js');

  const respondCloud = (req, res, curChannels) => {
    const startReq = new Date().getTime();
    const outputMode = req.query.mode || 'desc';

    // Validate mode parameter
    const validModes = ['desc', 'static'];
    if (!validModes.includes(outputMode)) {
      return res.status(400).json({
        error: {
          message: 'Invalid mode parameter. Must be either "desc" or "static".'
        }
      });
    }

    buildCloud(curChannels, config.offset, outputMode, (err, cloud) => {
      if (err) return res.status(400).json({error:{message:err}});

      // print stream position and time the request took
      const currTime = new Date().getTime();
      console.log('[Subtitle Request]');
      console.log('Run-Time: ' + ((currTime - config.startTime)/1000) + ' sec.');
      console.log('Request took: ' + (currTime - startReq) + ' ms');

      res.json(cloud);
    });
  };

  app.get('/cloud', (req, res) => {
    const curChannels = config.channels;
    respondCloud(req, res, curChannels);
  });


  app.get('/cloud/:id', (req, res) => {
    const channelId = parseInt(req.params.id, 10);

    // Input validation
    if (isNaN(channelId) || channelId < 0 || channelId >= config.channels.length) {
      return res.status(400).json({
        error: {
          message: 'Invalid channel ID. Must be a number between 0 and ' + (config.channels.length - 1)
        }
      });
    }

    const curChannels = [];
    // set channels of interest array to only the one requested channel id
    curChannels.push(config.channels[channelId]);
    respondCloud(req, res, curChannels);
  });

  app.get('/channels', (req, res) => {
    res.json(config.channels);
  });

};