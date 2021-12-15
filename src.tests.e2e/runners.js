const path = require('path');

const testsE2E = {
  main: {
    params: {
      PPD_ROOT: 'tests',
      PPD_DATA: {
        PPD_DATA: 'BAZ',
        myEnv: 'mainEnv',
      },
      PPD_SELECTORS: {
        PPD_SELECTORS: 'DDD',
      },
      PPD_TESTS: ['main', 'subTest'],
      PPD_LOG_SCREENSHOT: true,
      PPD_LOG_FULLPAGE: true,
      PPD_LOG_TIMER_SHOW: false,
      PPD_LOG_TIMESTAMP_SHOW: false,
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  mainENV: {
    env: {
      PPD_ROOT: 'tests',
      PPD_ROOT_ADDITIONAL: [path.join(__dirname, '..', 'node_modules\\@puppedo\\atoms')],
      PPD_TESTS: 'main',
      PPD_DATA: '{ "myEnv": "mainEnv" }',
      PPD_LOG_LEVEL_NESTED: 1,
      PPD_LOG_IGNORE_HIDE_LOG: 'true',
      PPD_LOG_TIMESTAMP_SHOW: 'false',
    },
  },
  dataCheck: {
    params: {
      PPD_ROOT: 'tests',
      PPD_TESTS: ['testDataCheck'],
      PPD_DATA: {
        CHECK_DATA: 'ARG_DATA',
      },
      PPD_DEBUG_MODE: true,
      PPD_LOG_LEVEL_NESTED: 0,
      PPD_LOG_TIMESTAMP_SHOW: false,
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  screencast: {
    params: {
      PPD_ROOT: 'tests',
      PPD_TESTS: 'screencast',
      PPD_DEBUG_MODE: true,
      PPD_LOG_TIMESTAMP_SHOW: false,
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  blankENV: {
    env: {
      PPD_ROOT: 'tests',
      PPD_ROOT_ADDITIONAL: [path.join(__dirname, '..', 'node_modules\\@puppedo\\atoms')],
      PPD_TESTS: 'blankEnv',
    },
  },
};

module.exports = testsE2E;
