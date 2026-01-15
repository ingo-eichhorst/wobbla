/** **********************************
            Load modules
*********************************** */

const express = require('express');
const subtitlesParse = require('subtitles-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const fs = require('fs');
const expressWs = require('express-ws')(app);
const config = require('./config/config.js');

/** **********************************
          Config Express
*********************************** */

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for static files
    crossOriginEmbedderPolicy: false,
  })
);

// Rate limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/cloud', limiter);

// CORS configuration - Allow only localhost in development
// In production, this should be configured to allow only specific domains
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:4242', 'http://127.0.0.1:4242'];
  const { origin } = req.headers;
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use('/videos', express.static('vids'));
app.use('/', express.static('static'));

/** **********************************
          Express Routes
*********************************** */

require('./routes/cloud.js')(app);

// enable Websockets
app.ws('/echo', function (ws, _req) {
  ws.on('message', function (msg) {
    ws.send(msg);
    expressWs.getWss('/echo').clients.forEach(function (client) {
      client.send(msg);
    });
  });
});

/** **********************************
          Init Subtitles 
*********************************** */

/**
 * Init subtitles
 * Read all the configured subtitle files and attach
 * the text to the main channels object
 */

for (let i = 0; i < config.channels.length; i++) {
  const srt = fs.readFileSync(config.channels[i].subPath, 'utf-8');
  // parse the subtitle to an object
  const subObj = subtitlesParse.fromSrt(srt, true);
  config.channels[i].subObj = subObj;
}

/** **********************************
        Make App Available
*********************************** */

const server = app.listen(4242, () => {
  const host = server.address().address;
  const { port } = server.address();

  console.log('Wobbla app listening at http://%s:%s', host, port);
});
