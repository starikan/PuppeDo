const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const testsE2E = require('./runners');
const { logClean } = require('./helpers');

const [, , ...args] = process.argv;
const [tests, create, ...tail] = args;

const testsResolve = tests ? tests.split(',').map((v) => v.trim()) : Object.keys(testsE2E);
const createResolve = create ? create === 'true' : false;

for (const testName of testsResolve) {
  const prc = spawnSync('node', ['./src.tests.e2e/runAllTests.js'], {
    env: {
      ...process.env,
      LOCAL_RUN_TEST: testName,
    },
  });

  const outData = prc.stdout.toString();
  console.log(outData);

  if (createResolve) {
    const filePath = path.join(__dirname, 'snapshots', `${testName}.log`);
    fs.writeFileSync(filePath, logClean(outData));
  } else {
    if (!tests) {
      const filePath = path.join(__dirname, 'snapshots', `${testName}.log`);
      const snapshotData = fs.readFileSync(filePath).toString();

      if (snapshotData !== logClean(outData)) {
        throw new Error(`E2E test error: ${testName}`);
      }
    }
  }
}
