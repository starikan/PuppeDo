const path = require('path');

const testsE2E = {
  main: {
    params: {
      PPD_DATA: {
        PPD_DATA: 'BAZ',
        myEnv: 'mainRunner',
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
  },
  mainENV: {
    env: {
      PPD_ROOT_ADDITIONAL: [path.join(__dirname, '..', 'node_modules\\@puppedo\\atoms')],
      PPD_TESTS: 'main',
      PPD_DATA: '{ "myEnv": "mainRunner" }',
      PPD_LOG_LEVEL_NESTED: 1,
      PPD_LOG_IGNORE_HIDE_LOG: 'true',
      PPD_LOG_TIMESTAMP_SHOW: 'false',
    },
    runBeforeTest: () => {},
  },
  mainCLI: {
    args: [
      'PPD_ROOT=tests',
      `PPD_ROOT_ADDITIONAL=${path.join(__dirname, '..', 'node_modules\\@puppedo\\atoms')}`,
      'PPD_TESTS=main',
      "PPD_DATA={'myEnv':'mainRunner'}",
      'PPD_LOG_EXTEND=true',
      'PPD_LOG_SCREENSHOT=true',
      'PPD_LOG_FULLPAGE=true',
    ],
    runBeforeTest: () => {},
  },
  mainPuppeteer: {
    env: { PPD_TESTS: 'main', PPD_DATA: '{ "myEnv": "mainRunnerPuppeteer" }', PPD_LOG_LEVEL_NESTED: 1 },
  },
  runnersManipulations: {
    params: { PPD_TESTS: 'runnersManipulations' },
  },
  errorIf: {
    params: { PPD_TESTS: 'errorIf' },
    isError: true,
  },
  testWithNoAtom: {
    params: { PPD_TESTS: 'testWithNoAtom', PPD_LOG_EXTEND: true, PPD_LOG_LEVEL_NESTED: 0 },
    isError: true,
  },
  mainWithError: {
    params: {
      PPD_ROOT: 'tests',
      PPD_TESTS: 'mainWithError',
      PPD_DATA: { myEnv: 'mainRunner' },
      PPD_FILES_IGNORE: ['tsconfig.json'],
    },
    isError: true,
  },
  dataCheck: {
    params: {
      PPD_TESTS: ['dataCheck'],
      PPD_DATA: {
        CHECK_DATA: 'ARG_DATA',
      },
      PPD_LOG_LEVEL_NESTED: 0,
      PPD_LOG_TIMESTAMP_SHOW: false,
    },
  },
  screencast: {
    params: { PPD_TESTS: 'screencast', PPD_LOG_TIMESTAMP_SHOW: false },
  },
  atoms: {
    params: { PPD_TESTS: 'atoms', PPD_DATA: { myEnv: 'mainRunner' } },
  },
  tags: {
    params: { PPD_TESTS: 'tagsTest', PPD_TAGS_TO_RUN: 'testTag' },
  },
  descriptions: {
    params: { PPD_TESTS: 'descriptionTest' },
  },
  logs: {
    params: { PPD_TESTS: 'logOptions' },
  },
  continueOnError: {
    params: { PPD_TESTS: 'continueOnError' },
    isError: true,
  },
  descriptionError: {
    params: { PPD_TESTS: 'descriptionError' },
    isError: true,
  },
  descriptionErrorNested: {
    params: { PPD_TESTS: 'descriptionErrorNested' },
    isError: true,
  },
  descriptionErrorDynamic: {
    params: { PPD_TESTS: 'descriptionErrorDynamic' },
    isError: true,
  },
  breakParentIfResult: {
    params: { PPD_TESTS: 'breakParentIfResult' },
  },
  recursion: {
    params: { PPD_TESTS: 'recursion' },
  },
  screenshots: {
    // TODO: 2021-12-16 S.Starodubov check files thats created
    params: {
      PPD_TESTS: 'screenshots',
      PPD_DATA: { myEnv: 'mainRunner' },
      PPD_LOG_EXTEND: true,
      PPD_LOG_SCREENSHOT: true,
      PPD_LOG_FULLPAGE: true,
    },
  },
  argsRedefine: {
    params: { PPD_TESTS: 'argsRedefine' },
  },
  skipSublingIfResult: {
    params: { PPD_TESTS: 'skipSublingIfResult' },
  },
  engineSupports: {
    params: { PPD_TESTS: 'engineSupports' },
  },
  engineSupportsExistsButError: {
    params: { PPD_TESTS: 'engineSupportsExistsButError' },
    isError: true,
  },
  engineSupportsFakeEngine: {
    params: { PPD_TESTS: 'engineSupportsFakeEngine' },
    isError: true,
  },
  debug: {
    params: { PPD_TESTS: 'debug' },
  },
  frame: {
    params: { PPD_TESTS: 'frame' },
  },
};

module.exports = testsE2E;
