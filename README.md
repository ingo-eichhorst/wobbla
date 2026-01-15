# wobbla

[![CI](https://github.com/ingo-eichhorst/wobbla/actions/workflows/ci.yml/badge.svg)](https://github.com/ingo-eichhorst/wobbla/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ingo-eichhorst/wobbla/branch/master/graph/badge.svg)](https://codecov.io/gh/ingo-eichhorst/wobbla)

The TVHackday2015 team Wobbla's app to build a word cloud of subtitle files.

**Note:** This application has been modernized in 2026 with updated dependencies, modern JavaScript syntax, comprehensive tests, and security improvements while maintaining 100% backward compatibility with the original functionality.

The app allows you to build a program of separately running channels. Each subtitle stands for one channel. After the app starts running, the subtitles start to run in real time with a 5 (configurable) minute offset.
It scans the last 5 minutes of the requested channel/subtitle and weights it by its occurrences and time passed since the last occurrence.

Please see the description video for more details:
https://www.youtube.com/watch?v=XK9OCQxX62k

The app comes with a simple frontend but can also work with other frontends as done at the TV Hackday.

## What's New (2026 Modernization)

### Updated Dependencies

- **Express**: Upgraded from 4.13.3 (2015) to 5.2.1 (2026)
- **express-ws**: Upgraded from 1.0.0-rc.1 to 5.0.2
- Added **helmet** for security headers
- Added **express-rate-limit** for API rate limiting

### Modern JavaScript

- Replaced `var` with `const`/`let` for better scoping
- Updated to arrow functions for cleaner syntax
- Improved code readability and maintainability
- Fixed typos and improved comments

### Security Enhancements

- Added Helmet middleware for security headers
- Implemented rate limiting (100 requests per 15 minutes per IP)
- Added input validation for route parameters
- Improved CORS configuration with allowlist
- Validates channel IDs and mode parameters

### Code Quality & CI/CD

- **ESLint**: Enforces Airbnb JavaScript Style Guide with Node.js customizations
- **Prettier**: Automatic code formatting for consistent style
- **Pre-commit Hooks**: Husky + lint-staged ensure code quality before commits
- **GitHub Actions**: Automated CI pipeline runs on every push and PR
  - Linting (ESLint)
  - Format checking (Prettier)
  - Tests on Node.js 18.x, 20.x, and 22.x
  - Security audits
  - Package integrity checks

Run linting and formatting:

```bash
npm run lint           # Check for linting errors
npm run lint:fix       # Fix linting errors automatically
npm run format         # Format code with Prettier
npm run format:check   # Check if code is formatted correctly
```

### Testing

- Comprehensive test suite with Jest
- 17 test cases covering all API endpoints
- Unit tests for core business logic
- Integration tests for API routes
- Run tests with: `npm test`
- View coverage with: `npm run test:coverage`

### Maintained Functionality

All original features work exactly as before:

- Real-time subtitle processing
- Word cloud generation with time-based weighting
- Support for multiple channels
- Descending and static cloud modes
- WebSocket echo functionality

## SetUp

#### Install required Software

Only required software is Node.js (v14 or higher recommended, tested on v22).
To install, follow the instructions for your OS at: https://nodejs.org/en/download/package-manager/

#### Download

Download this package and unzip or clone the git repository.

#### Install Dependencies

Go to the root folder of this app and run:

```bash
npm install
```

#### Configuration

The configuration is made in _./config/config.js_

###### Channel Configuration

This defines the channels/subtitle files. 4 example srt-files are included to help you get started.

<pre>[
  {
    name: "Frau TV (WDR)",  // Name of the current airing 
    chName: "WDR", // channel Name
    subPath: "./subs/frautv2.srt", // path to the subtitle file (only *.srt will work)
    url: "/videos/frautv.mp4" // url to a related video file - the vid-folder (./vid/some.mp4) is used to statically deliver files as "/video/some.mp4" download
  },
  {...}
]</pre>

###### Advanced Config:

- wordMinOccurrence --> Minimum occurance of a Word before it is used for processing (default: 2)
- cloudMaxEntries --> Maximum entries of the via API delivered cloud (default: 50)
- offset --> offset in min - at wich position the subtitles start to run

#### Start App

To start the app, simply run:

```bash
node app.js
```

The frontend can now be visited at: http://127.0.0.1:4242

#### Run Tests

To run the test suite:

```bash
npm test                  # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
```

## API

The API is RESTful and returns JSON.

**Security:** The API is rate-limited to 100 requests per 15 minutes per IP address. All endpoints include proper input validation and error handling.

### Endpoints

#### GET /channels

Returns all channels defined in the config with their parsed subtitle files.

**Response:**

```json
[
  {
    "name": "Channel Name",
    "chName": "Short Name",
    "subPath": "./path/to/subtitle.srt",
    "url": "video-url"
  }
]
```

#### GET /cloud

Returns a word cloud for all channels.

**Query Parameters:**

- `mode` (optional): `desc` (default) or `static`
  - `desc`: Descending list of entries by ranking
  - `static`: Words maintain their position in the cloud

**Response:**

```json
[
  {
    "text": "word",
    "size": 10,
    "channels": [
      {
        "name": "Channel Name",
        "chName": "Short Name",
        "url": "video-url"
      }
    ]
  }
]
```

**Examples:**

```
GET /cloud
GET /cloud?mode=desc
GET /cloud?mode=static
```

#### GET /cloud/:id

Returns a word cloud for a specific channel by ID (0-indexed).

**Parameters:**

- `id`: Channel index (must be a valid number between 0 and channel count - 1)

**Query Parameters:**

- `mode` (optional): `desc` or `static`

**Examples:**

```
GET /cloud/0
GET /cloud/1?mode=static
```

**Error Responses:**

- `400 Bad Request`: Invalid channel ID or mode parameter
- `429 Too Many Requests`: Rate limit exceeded

## Known Limitations & Future Improvements

The following areas could be improved in future versions:

### Performance

- Processing only the changing delta instead of the whole dataset
- Processing in child processes to separate CPU-intensive operations from the router
- Most operations run synchronously - async operations would improve performance
- Optimizing the processing step arrangement
- Consider processing subtitles on server request rather than from the client

### Features

- Multi-language support: Stopword lists in different languages would allow non-German content
- Automatic restart when the last subtitle completes

### Code Quality

✅ **ADDRESSED in 2026 modernization:**

- ~~Error handling~~ - Now includes proper input validation and error responses
- ~~Variable naming~~ - Improved throughout the codebase
- ~~Modern JavaScript~~ - Updated to ES6+ syntax with const/let and arrow functions

## License

MIT
