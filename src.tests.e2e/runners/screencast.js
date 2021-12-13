const params = {
  PPD_ROOT: 'tests',
  PPD_TESTS: 'screencast',
  PPD_DEBUG_MODE: true,
  PPD_LOG_TIMESTAMP_SHOW: false,
};

const runBeforeTest = () => {
  // Nothing to do
};

module.exports = { params, runBeforeTest };
