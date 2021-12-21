const path = require('path');

const testsE2E = {
  main: {
    params: {
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
      PPD_TESTS: 'main',
      PPD_DATA: '{ "myEnv": "mainEnv_puppeteer" }',
      PPD_LOG_LEVEL_NESTED: 1,
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  envsManipulations: {
    params: {
      PPD_TESTS: 'envsManipulations',
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  errorIf: {
    params: {
      PPD_TESTS: 'errorIf',
    },
    runBeforeTest: () => require('@puppedo/atoms'),
    isError: true,
  },
  testWithNoAtom: {
    params: {
      PPD_TESTS: 'testWithNoAtom',
      PPD_DATA: { myEnv: 'mainEnv' },
      PPD_LOG_EXTEND: true,
      PPD_LOG_LEVEL_NESTED: 0,
    },
    runBeforeTest: () => require('@puppedo/atoms'),
    isError: true,
  },
  mainWithError: {
    params: {
      PPD_TESTS: 'mainWithError',
      PPD_DATA: { myEnv: 'mainEnv' },
    },
    runBeforeTest: () => require('@puppedo/atoms'),
    isError: true,
  },
  dataCheck: {
    params: {
      PPD_TESTS: ['dataCheck'],
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
      PPD_TESTS: 'screencast',
      PPD_DEBUG_MODE: true,
      PPD_LOG_TIMESTAMP_SHOW: false,
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  atoms: {
    params: {
      PPD_TESTS: 'atoms',
      PPD_DATA: { myEnv: 'mainEnv' },
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  tags: {
    params: {
      PPD_TESTS: 'tagsTest',
      PPD_DATA: { myEnv: 'mainEnv' },
      PPD_TAGS_TO_RUN: 'testTag',
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  descriptions: {
    params: {
      PPD_TESTS: 'descriptionTest',
      PPD_DATA: { myEnv: 'mainEnv' },
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  logs: {
    params: {
      PPD_TESTS: 'logOptions',
      PPD_DATA: { myEnv: 'mainEnv' },
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  continueOnError: {
    params: {
      PPD_TESTS: 'continueOnError',
      PPD_DATA: { myEnv: 'mainEnv' },
      PPD_CONTINUE_ON_ERROR_ENABLED: true,
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  breakParentIfResult: {
    params: {
      PPD_TESTS: 'breakParentIfResult',
      PPD_DATA: { myEnv: 'mainEnv' },
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  recursion: {
    params: {
      PPD_TESTS: 'recursion',
      PPD_DATA: { myEnv: 'mainEnv' },
    },
    runBeforeTest: () => require('@puppedo/atoms'),
  },
  screenshots: {
    // TODO: 2021-12-16 S.Starodubov check files thats created
    params: {
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
