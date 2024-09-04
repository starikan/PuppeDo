const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const testsE2E = require('./runners');

const [, , ...args] = process.argv;
const [tests, create] = args;

const testsResolved = tests ? tests.split(',').map((v) => v.trim()) : Object.keys(testsE2E);
const createResolved = create ? create === 'true' : false;

const logClean = (text) => {
  const newText = text
    .replace(/\d{2}:\d{2}:\d{2}.\d{3}/g, '00:00:00.000')
    .replace(/: \d+\.\d+ s./g, ': 00.000 s.')
    .replace(/start on '\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}.\d{3}'/g, "start on '0000-00-00_00-00-00.000'")
    .replace(/screenshot: \[.+?\]/g, 'screenshot: [screenshot_path]')
    .replace(/\([^f].+?PuppeDo\\node_modules/g, '(')
    .replace(/file:\/\/\/.+?node_modules/g, 'file:///')
    .replace(/file:\/\/\/.+?output\.log/g, 'file:///output.log')
    .replace(/file:\/\/\/.+?tests/g, 'file:///')
    .replace(/file:\/\/\/.+?Plugins/g, 'file:///Plugins')
    .replace(/\(.+?webpack:/g, '(')
    .replace(/\.[jt]s.+?\)/g, ')')
    .replace(/:\d+:\d+\)/g, ')')
    .replace(/\(.+?src\.tests\.e2e/g, '(');

  const splitedText = newText.split('\n');
  const startIndex = splitedText.indexOf(
    splitedText.find((v) => v.search('============== ALL DATA ==============') > 0),
  );
  const endIndex = splitedText.indexOf(
    splitedText.find((v) => v.search('============== EXTEND FILE ==============') > 0),
  );

  if (startIndex > 0 && endIndex > 0) {
    splitedText.splice(startIndex, endIndex - startIndex);
  }

  return splitedText.join('\n');
};

for (const testName of testsResolved) {
  if (!testsE2E[testName]) {
    throw new Error(`Can't find test "${testName}" in runners`);
  }
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

  if (createResolved) {
    const filePath = path.join(__dirname, 'snapshots', `${testName}.log`);
    fs.writeFileSync(filePath, logClean(outData));
  } else {
    if (!tests) {
      const filePath = path.join(__dirname, 'snapshots', `${testName}.log`);
      const snapshotData = fs.readFileSync(filePath).toString();

      if (snapshotData !== logClean(outData)) {
        console.log(snapshotData);
        console.log(logClean(outData));
        throw new Error(`E2E test error: ${testName}`);
      }
    }
  }
}

console.log('All E2E tests passed');
