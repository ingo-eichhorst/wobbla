'use strict';

module.exports = (app) => {
  const config = require('../config/config.js');
  const buildCloud = require('../lib/build_cloud.js');

  const respondCloud = (req, res, curChannels) => {
    const startReq = new Date().getTime();
    const outputMode = req.query.mode || 'desc';
    
    buildCloud(curChannels, config.offset, outputMode, (err, cloud) => {
      if (err) {
        console.error('Error building cloud:', err);
        return res.status(400).json({ error: { message: err } });
      }
      
      // print stream position and time the request took
      const currTime = new Date().getTime();
      console.log('[Subtitle Request]');
      console.log('Run-Time: ' + ((currTime - config.startTime) / 1000) + ' sec.');
      console.log('Request took: ' + (currTime - startReq) + ' ms');
      
      res.json(cloud);
    });
  };

  app.get('/cloud', (req, res) => {
    const curChannels = config.channels;
    respondCloud(req, res, curChannels);
  });

  app.get('/cloud/:id', (req, res) => {
    const curChannels = [];
    const channelId = parseInt(req.params.id);
    
    if (channelId >= 0 && channelId < config.channels.length) {
      curChannels.push(config.channels[channelId]);
      respondCloud(req, res, curChannels);
    } else {
      res.status(404).json({ error: { message: 'Channel not found' } });
    }
  });

  app.get('/channels', (req, res) => {
    res.json(config.channels);
  });
};