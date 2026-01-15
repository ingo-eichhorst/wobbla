const buildCloud = require('../lib/build_cloud.js');

// Mock the config
jest.mock('../config/config.js', () => {
  return {
    wordMinOccurrence: 2,
    cloudMaxEntries: 50,
    offset: 5,
    startTime: new Date().getTime() - 60000, // Start 1 minute ago
  };
});

describe('buildCloud function', () => {
  const mockChannels = [
    {
      name: 'Test Channel',
      chName: 'TEST',
      url: '',
      subObj: [
        {
          startTime: 0,
          endTime: 2000,
          text: 'Hello world',
        },
        {
          startTime: 2000,
          endTime: 4000,
          text: 'Hello again',
        },
        {
          startTime: 10000,
          endTime: 12000,
          text: 'Test word test',
        },
      ],
    },
  ];

  it('should build a cloud array with word counts', (done) => {
    buildCloud(mockChannels, 5, 'desc', (err, cloud) => {
      expect(err).toBeNull();
      expect(Array.isArray(cloud)).toBe(true);
      done();
    });
  });

  it('should handle desc mode', (done) => {
    buildCloud(mockChannels, 5, 'desc', (err, cloud) => {
      expect(err).toBeNull();
      expect(Array.isArray(cloud)).toBe(true);
      // Cloud should be sorted by size descending
      if (cloud.length > 1) {
        for (let i = 0; i < cloud.length - 1; i++) {
          expect(cloud[i].size).toBeGreaterThanOrEqual(cloud[i + 1].size);
        }
      }
      done();
    });
  });

  it('should handle static mode', (done) => {
    buildCloud(mockChannels, 5, 'static', (err, cloud) => {
      expect(err).toBeNull();
      expect(Array.isArray(cloud)).toBe(true);
      done();
    });
  });

  it('should return error for invalid mode', (done) => {
    buildCloud(mockChannels, 5, 'invalid', (err) => {
      expect(err).toBe('undefined output mode');
      done();
    });
  });

  it('should filter words below minimum occurrence', (done) => {
    buildCloud(mockChannels, 5, 'desc', (err, cloud) => {
      expect(err).toBeNull();
      // All words in cloud should meet minimum occurrence
      cloud.forEach((word) => {
        expect(word.size).toBeGreaterThanOrEqual(2);
      });
      done();
    });
  });

  it('should limit cloud to max entries', (done) => {
    buildCloud(mockChannels, 5, 'desc', (err, cloud) => {
      expect(err).toBeNull();
      expect(cloud.length).toBeLessThanOrEqual(50);
      done();
    });
  });

  it('should include channel information in cloud entries', (done) => {
    buildCloud(mockChannels, 5, 'desc', (err, cloud) => {
      expect(err).toBeNull();
      if (cloud.length > 0) {
        expect(cloud[0]).toHaveProperty('text');
        expect(cloud[0]).toHaveProperty('size');
        expect(cloud[0]).toHaveProperty('channels');
        expect(Array.isArray(cloud[0].channels)).toBe(true);
        if (cloud[0].channels.length > 0) {
          expect(cloud[0].channels[0]).toHaveProperty('name');
          expect(cloud[0].channels[0]).toHaveProperty('chName');
        }
      }
      done();
    });
  });
});
