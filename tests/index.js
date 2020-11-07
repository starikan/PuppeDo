require('@puppedo/atoms');
const ppd = require('../index');
const runServer = require('./server');

const run = async () => {
  // Test with direct run from JS
  await ppd.run({
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
  });
};

try {
  runServer();
  run();
} catch (error) {
  console.log(error);
}
