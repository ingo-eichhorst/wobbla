const request = require('supertest');
const express = require('express');
const subtitlesParse = require('subtitles-parser');
const fs = require('fs');

// Mock the config to avoid reading actual files during test setup
jest.mock('../config/config.js', () => {
  return {
    channels: [
      {
        name: "Test Channel 1",
        chName: "TEST1",
        subPath: "./subs/test1.srt",
        url: "",
        subObj: []
      }
    ],
    wordMinOccurrence: 2,
    cloudMaxEntries: 50,
    globalCloud: [50],
    offset: 5,
    startTime: new Date().getTime()
  };
});

describe('Wobbla API Endpoints', () => {
  let app;

  beforeAll(() => {
    // Create a test app instance
    app = express();

    // Set up CORS
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    app.use('/videos', express.static('vids'));
    app.use('/', express.static('static'));

    // Load routes
    require('../routes/cloud.js')(app);
  });

  describe('GET /channels', () => {
    it('should return list of channels', async () => {
      const response = await request(app)
        .get('/channels')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('chName');
      expect(response.body[0]).toHaveProperty('subPath');
    });
  });

  describe('GET /cloud', () => {
    it('should return word cloud for all channels', async () => {
      const response = await request(app)
        .get('/cloud')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should support mode=desc query parameter', async () => {
      const response = await request(app)
        .get('/cloud?mode=desc')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should support mode=static query parameter', async () => {
      const response = await request(app)
        .get('/cloud?mode=static')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 400 for invalid mode', async () => {
      const response = await request(app)
        .get('/cloud?mode=invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /cloud/:id', () => {
    it('should return word cloud for specific channel', async () => {
      const response = await request(app)
        .get('/cloud/0')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should support mode parameter for specific channel', async () => {
      const response = await request(app)
        .get('/cloud/0?mode=static')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 400 for invalid channel ID (negative)', async () => {
      const response = await request(app)
        .get('/cloud/-1')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('Invalid channel ID');
    });

    it('should return 400 for invalid channel ID (out of bounds)', async () => {
      const response = await request(app)
        .get('/cloud/999')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('Invalid channel ID');
    });

    it('should return 400 for non-numeric channel ID', async () => {
      const response = await request(app)
        .get('/cloud/abc')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('Invalid channel ID');
    });
  });
});
