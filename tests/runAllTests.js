require('@puppedo/atoms');
const ppd = require('../index');
const runServer = require('./server');

const entryCleaner = (entry) => {
  return entry;
};

const logsCleaner = (logs) => {
  return Object.fromEntries(
    Object.entries(logs).map((v) => {
      v[1] = v[1].map(entryCleaner);
      return v;
    }),
  );
};

// Test with direct run from JS
const From_JS_no_ENV = {
  PPD_ROOT: 'tests',
  PPD_DATA: {
    PPD_DATA: 'BAZ',
    myEnv: 'mainEnv',
  },
  PPD_SELECTORS: {
    PPD_SELECTORS: 'DDD',
  },
  PPD_TESTS: ['main', 'subTest'],
  PPD_DEBUG_MODE: true,
  PPD_LOG_SCREENSHOT: true,
  PPD_LOG_FULLPAGE: true,
  PPD_LOG_TIMER_SHOW: false,
  PPD_LOG_TIMESTAMP_SHOW: false,
};

const run = async () => {
  const { logs } = await ppd.run(From_JS_no_ENV);
  console.log(JSON.stringify(logsCleaner(logs, null, 2)));
};

try {
  runServer();
  run();
} catch (error) {
  console.log(error);
}
