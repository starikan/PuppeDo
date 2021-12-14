// Test with direct run from JS
const params = {
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
};

const runBeforeTest = () => {
  // Nothing to do
};

const runAfterTest = () => {
  // Nothing to do
};

module.exports = { params, runBeforeTest, runAfterTest };
