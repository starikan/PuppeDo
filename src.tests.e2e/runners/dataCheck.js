const params = {
  PPD_ROOT: 'tests',
  PPD_TESTS: ['testDataCheck'],
  PPD_DATA: {
    CHECK_DATA: 'ARG_DATA',
  },
  PPD_DEBUG_MODE: true,
  PPD_LOG_LEVEL_NESTED: 0,
  PPD_LOG_TIMESTAMP_SHOW: false,
};

const runBeforeTest = () => {
  // Nothing to do
};

const runAfterTest = () => {
  // Nothing to do
};

module.exports = { params, runBeforeTest, runAfterTest };
