const path = require('path');

const env = {
  PPD_ROOT: 'tests',
  PPD_ROOT_ADDITIONAL: [path.join(__dirname, '..', '..', 'node_modules\\@puppedo\\atoms')],
  PPD_TESTS: 'blankEnv',
};

module.exports = { env };
