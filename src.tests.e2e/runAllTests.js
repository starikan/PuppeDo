const ppd = require('../index');

const runServer = require('./server');

const testsE2E = require('./runners');

const runTest = async (runner) => {
  if (!runner) {
    return [];
  }
  runner.runBeforeTest && (await runner.runBeforeTest());
  await ppd.run(runner.params || {});
  runner.runAfterTest && (await runner.runAfterTest());
};

const start = async () => {
  try {
    runServer();

    const LOCAL_RUN_TEST = process.env.LOCAL_RUN_TEST;
    const runners = LOCAL_RUN_TEST ? [LOCAL_RUN_TEST] : Object.keys(testsE2E);

    for (const runner of runners) {
      await runTest(testsE2E[runner]);
    }
  } catch (error) {
    console.log(error);
  }
};

start();
