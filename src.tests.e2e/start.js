const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const testsE2E = require('./runners');

const [, , ...args] = process.argv;
const [tests, create, ...tail] = args;

const testsResolve = tests ? tests.split(',').map((v) => v.trim()) : Object.keys(testsE2E);
const createResolve = create ? create === 'true' : false;

const logClean = (text) => {
  let newText = text;
  newText = newText.replace(/\d{2}:\d{2}:\d{2}.\d{3}/g, '00:00:00.000');
  newText = newText.replace(/: \d+\.\d+ s./g, ': 00.000 s.');
  newText = newText.replace(
    /start on '\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}.\d{3}'/g,
    "start on '0000-00-00_00-00-00.000'",
  );
  newText = newText.replace(/screenshot: \[.+?\]/g, 'screenshot: [screenshot_path]');
  return newText;
};

for (const testName of testsResolve) {
  const options = {
    env: {
      ...process.env,
      LOCAL_RUN_TEST: testName,
      ...(testsE2E[testName].env || {}),
    },
  };
  const args = testsE2E[testName].args ? testsE2E[testName].args.join(' ') : '';
  const prc = spawnSync('node', ['./src.tests.e2e/runAllTests.js', args], options);

  const outData = prc.stdout.toString();
  // console.log(outData);

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
