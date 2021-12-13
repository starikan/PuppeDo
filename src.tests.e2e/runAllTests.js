const fs = require('fs');
const path = require('path');

require('@puppedo/atoms');
const ppd = require('../index');
const runServer = require('../tests/server');

const { logsCleaner } = require('./helpers');

const testsE2E = require('./runners/index');

const run = async (runner) => {
  const LOCAL_RUN_TEST = process.env.LOCAL_RUN_TEST || runner;
  if (LOCAL_RUN_TEST) {
    await testsE2E[LOCAL_RUN_TEST].runBeforeTest();
    await ppd.run(testsE2E[LOCAL_RUN_TEST].params);
    return;
  }

  for (const testName of Object.keys(testsE2E)) {
    await testsE2E[testName].runBeforeTest();
    const { logs } = await ppd.run(testsE2E[testName].params);
    const clearedLogs = logsCleaner(logs, null, 2);

    const filePath = path.join(__dirname, 'snapshots', `${testName}.log`);
    const snapshotData = fs.readFileSync(filePath).toString();

    if (snapshotData !== JSON.stringify(clearedLogs, null, 2)) {
      throw new Error(`E2E test error: ${testName}`);
    }
  }
};

try {
  runServer();
  run();
} catch (error) {
  console.log(error);
}
