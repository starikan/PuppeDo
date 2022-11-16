const ppd = require('../index');

const runServer = require('./server');

const testsE2E = require('./runners');

const runBeforeTest = () => require('@puppedo/atoms');

const runTest = async (runner, options = {}) => {
  if (!runner) {
    return [];
  }

  if (runner.runBeforeTest) {
    await runner.runBeforeTest();
  } else {
    runBeforeTest();
  }

  await ppd.run(runner.params || {}, options);

  if (runner.runAfterTest) {
    await runner.runAfterTest();
  }
};

const start = async () => {
  const LOCAL_RUN_TEST = process.env.LOCAL_RUN_TEST;
  const runners = LOCAL_RUN_TEST ? [LOCAL_RUN_TEST] : Object.keys(testsE2E);
  try {
    runServer();
    for (const runner of runners) {
      try {
        await runTest(testsE2E[runner]);
      } catch (error) {
        if (testsE2E[runner].isError) {
          process.exit(0);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

start();
