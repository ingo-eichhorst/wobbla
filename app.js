'use strict';

const express = require('express');
const subtitlesParse = require('subtitles-parser');
const fs = require('fs');
const expressWs = require('express-ws');
const config = require('./config/config.js');

const app = express();
expressWs(app);

/************************************
          Config Express
************************************/

// deactivate CORS to allow access from different servers
app.use((req, res, next) => {
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
app.ws('/echo', (ws, req) => {
  ws.on('message', (msg) => {
    ws.send(msg);
    expressWs.getWss('/echo').clients.forEach((client) => {
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

for (let i = 0; i < config.channels.length; i++) {
  try {
    const srt = fs.readFileSync(config.channels[i].subPath, 'utf-8');
    // parse the subtitle to an object
    const subObj = subtitlesParse.fromSrt(srt, true);
    config.channels[i].subObj = subObj;
  } catch (error) {
    console.error(`Error reading subtitle file ${config.channels[i].subPath}:`, error);
  }
}

/************************************
        Make App Available
************************************/

const server = app.listen(4242, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Wobbla app listening at http://%s:%s', host, port);
});
