const path = require('path');

const params = null;

const env = {
  PPD_ROOT: 'tests',
  PPD_ROOT_ADDITIONAL: [path.join(__dirname, '..', '..', 'node_modules\\@puppedo\\atoms')],
  PPD_TESTS: 'main',
  PPD_DATA: '{ "myEnv": "mainEnv" }',
  PPD_LOG_LEVEL_NESTED: 1,
  PPD_LOG_IGNORE_HIDE_LOG: 'true',
  PPD_LOG_TIMESTAMP_SHOW: 'false',
};

const runBeforeTest = () => {
  // Nothing to do
};

const runAfterTest = () => {
  // Nothing to do
};

module.exports = { params, runBeforeTest, runAfterTest, env };
