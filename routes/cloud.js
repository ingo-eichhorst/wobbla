'use strict';

module.exports = function(app) {

  var config = require('../config/config.js');
  var buildCloud = require('../lib/build_cloud.js');

  var respondCloud = function (req, res, curChannels) {
    var startReq = new Date().getTime();
    var outputMode = req.query.mode || 'desc';
    buildCloud(curChannels, config.offset, outputMode, function(err, cloud){
      if (err) res.status(400).json({error:{message:err}});
      
      // print stream position and time the request took
      var currTime = new Date().getTime();
      console.log('[Subtitle Request]');
      console.log('Run-Time: ' + ((currTime - config.startTime)/1000) + ' sec.');
      console.log('Request took: ' + (currTime - startReq) + ' ms');
      
      res.json(cloud);
    });
  }

  app.get('/cloud', function (req, res) {
    var curChannels = config.channels;
    respondCloud(req, res, curChannels);
  });


  app.get('/cloud/:id', function (req, res) {
    var curChannels = [];
    // set channels of interest array to only the one requested channel id
    curChannels.push(config.channels[req.params.id]);
    respondCloud(req, res, curChannels);
  });

  app.get('/channels', function (req, res) {
    res.json(config.channels);
  });

}