const fs = require('fs');
const path = require('path');

require('@puppedo/atoms');
const ppd = require('../index');
const runServer = require('./server');

const { logsCleaner } = require('./helpers');

const testsE2E = require('./runners');

const run = async () => {
  for (const testName of Object.keys(testsE2E)) {
    try {
      await testsE2E[testName].runBeforeTest();
      const { logs } = await ppd.run(testsE2E[testName].params);
      const clearedLogs = logsCleaner(logs);

      const filePath = path.join(__dirname, 'snapshots', `${testName}.log`);
      fs.writeFileSync(filePath, JSON.stringify(clearedLogs, null, 2));
    } catch (e) {
      debugger;
    }
  }
};

try {
  runServer();
  run();
} catch (error) {
  console.log(error);
}
