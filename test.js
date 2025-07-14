// Simple test suite to verify that the app functions correctly
const http = require('http');
const assert = require('assert');

const baseUrl = 'http://localhost:4242';
let tests = 0;
let passed = 0;

function runTest(name, testFn) {
  tests++;
  console.log(`Running: ${name}`);
  testFn()
    .then(() => {
      passed++;
      console.log(`✅ ${name}`);
    })
    .catch(err => {
      console.error(`❌ ${name}: ${err.message}`);
    });
}

function httpGet(path) {
  return new Promise((resolve, reject) => {
    http.get(baseUrl + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Test suite
async function runTests() {
  console.log('Testing Wobbla App...\n');

  await runTest('Channels endpoint returns 4 channels', async () => {
    const channels = await httpGet('/channels');
    assert.strictEqual(channels.length, 4);
    assert.strictEqual(channels[0].name, 'Tears of Steal');
    assert.strictEqual(channels[1].name, 'Sintel');
    assert.strictEqual(channels[2].name, 'Frau TV (WDR)');
    assert.strictEqual(channels[3].name, 'Aktuelle Stunde (Einsfestival)');
  });

  await runTest('Cloud endpoint returns 50 entries', async () => {
    const cloud = await httpGet('/cloud');
    assert.strictEqual(cloud.length, 50);
    assert(cloud[0].text);
    assert(cloud[0].size);
    assert(Array.isArray(cloud[0].channels));
  });

  await runTest('Cloud static mode works', async () => {
    const cloud = await httpGet('/cloud?mode=static');
    assert.strictEqual(cloud.length, 50);
  });

  await runTest('Individual channel endpoint works', async () => {
    const cloud = await httpGet('/cloud/0');
    assert(cloud.length > 0);
    assert(cloud[0].text);
    assert(cloud[0].size);
  });

  await runTest('Static files are served', async () => {
    const html = await httpGet('/');
    assert(html.includes('Wobbla TV Cloud'));
    assert(html.includes('ng-app="cloudApp"'));
  });

  await runTest('Controller.js is accessible', async () => {
    const js = await httpGet('/controller.js');
    assert(js.includes('cloudApp'));
    assert(js.includes('CloudController'));
  });

  // Wait for all tests to complete
  setTimeout(() => {
    console.log(`\n${passed}/${tests} tests passed`);
    process.exit(passed === tests ? 0 : 1);
  }, 1000);
}

runTests();