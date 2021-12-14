const path = require('path');

const params = null;

const runBeforeTest = () => {
  process.env.PPD_ROOT = 'tests';
  process.env.PPD_ROOT_ADDITIONAL = [path.join(__dirname, '..', '..', 'node_modules\\@puppedo\\atoms')];
  process.env.PPD_TESTS = 'main';
  process.env.PPD_DATA = '{ "myEnv": "mainEnv" }';
  process.env.PPD_LOG_LEVEL_NESTED = 1;
  process.env.PPD_LOG_IGNORE_HIDE_LOG = 'true';
  process.env.PPD_LOG_TIMESTAMP_SHOW = 'false';
};

const runAfterTest = () => {
  delete process.env.PPD_ROOT;
  delete process.env.PPD_ROOT_ADDITIONAL;
  delete process.env.PPD_TESTS;
  delete process.env.PPD_DATA;
  delete process.env.PPD_DEBUG_MODE;
  delete process.env.PPD_LOG_LEVEL_NESTED;
  delete process.env.PPD_LOG_IGNORE_HIDE_LOG;
  delete process.env.PPD_LOG_TIMESTAMP_SHOW;
};

module.exports = { params, runBeforeTest, runAfterTest };
