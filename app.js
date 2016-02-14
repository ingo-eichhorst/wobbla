'use strict';

/************************************
            Load modules
************************************/

var express = require('express');
var subtitlesParse = require('subtitles-parser');
var app = express();
var fs = require('fs');
var expressWs = require('express-ws')(app); //app = express app
var config = require('./config/config.js');

/************************************
          Config Express
************************************/

// deactivate CORS to allow access from different servers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/videos', express.static('vids'));
app.use('/', express.static('static'));


/************************************
          Express Routes
************************************/

require('./routes/cloud.js')(app);

// enable Websockets
app.ws('/echo', function(ws, req) {
  ws.on('message', function(msg) {
    ws.send(msg);
    expressWs.getWss('/echo').clients.forEach(function (client) {
      client.send(msg);
    });
  });
});


/************************************
          Init Subtitles 
************************************/

/** 
 * Init subtitles
 * Read all the configurated subtitle files and attach 
 * the text to the main channels object
 */

for (var i = 0; i < config.channels.length; i++) {
  var srt = fs.readFileSync(config.channels[i].subPath, 'utf-8');
  // parse the subtitle to an object
  var subObj = subtitlesParse.fromSrt(srt, true);
  config.channels[i].subObj = subObj;
}


/************************************
        Make App Available
************************************/

var server = app.listen(4242, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Wobbla app listening at http://%s:%s', host, port);
});
