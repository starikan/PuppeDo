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
  mainCLI: {
    args: [
      'PPD_ROOT=tests',
      `PPD_ROOT_ADDITIONAL=${path.join(__dirname, '..', 'node_modules\\@puppedo\\atoms')}`,
      'PPD_TESTS=main',
      "PPD_DATA={'myEnv':'mainEnv'}",
      'PPD_DEBUG_MODE=true',
      'PPD_LOG_EXTEND=true',
      'PPD_LOG_SCREENSHOT=true',
      'PPD_LOG_FULLPAGE=true',
    ],
  },
  mainPuppeteer: {
    env: {
      PPD_ROOT: 'tests',
      PPD_TESTS: 'main',
      PPD_DATA: '{ "myEnv": "mainEnv_puppeteer" }',
      PPD_LOG_LEVEL_NESTED: 1,
    },
    runBeforeTest: () => require('@puppedo/atoms'),
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
  atoms: {
    params: {
      PPD_ROOT: 'tests',
      PPD_TESTS: 'atomsTest',
      PPD_DATA: { myEnv: 'mainEnv' },
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  tags: {
    params: {
      PPD_ROOT: 'tests',
      PPD_TESTS: 'tagsTest',
      PPD_DATA: { myEnv: 'mainEnv' },
      PPD_TAGS_TO_RUN: 'testTag',
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  descriptions: {
    params: {
      PPD_ROOT: 'tests',
      PPD_TESTS: 'descriptionTest',
      PPD_DATA: { myEnv: 'mainEnv' },
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  logs: {
    params: {
      PPD_ROOT: 'tests',
      PPD_TESTS: 'logOptions',
      PPD_DATA: { myEnv: 'mainEnv' },
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  continueOnError: {
    params: {
      PPD_ROOT: 'tests',
      PPD_TESTS: 'continueOnError',
      PPD_DATA: { myEnv: 'mainEnv' },
      PPD_CONTINUE_ON_ERROR_ENABLED: true,
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  breakParentIfResult: {
    params: {
      PPD_ROOT: 'tests',
      PPD_TESTS: 'breakParentIfResult',
      PPD_DATA: { myEnv: 'mainEnv' },
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  recursion: {
    params: {
      PPD_ROOT: 'tests',
      PPD_TESTS: 'recursion',
      PPD_DATA: { myEnv: 'mainEnv' },
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  screenshots: {
    params: {
      PPD_ROOT: 'tests',
      PPD_TESTS: 'screenshots',
      PPD_DATA: { myEnv: 'mainEnv' },
      PPD_LOG_EXTEND: true,
      PPD_LOG_SCREENSHOT: true,
      PPD_LOG_FULLPAGE: true,
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
};

module.exports = testsE2E;
