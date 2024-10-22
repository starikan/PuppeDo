const ppd = require('../index');

const runServer = require('./server');

const testsE2E = require('./runners');

// eslint-disable-next-line global-require
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

  return null;
};

const start = async () => {
  const { LOCAL_RUN_TEST } = process.env;
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
