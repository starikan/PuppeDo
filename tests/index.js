const ppd = require('../index');
const _ = require('lodash');

const run = async () => {
  // Test with direct run from JS
  await ppd.main({
    PPD_ROOT: 'tests',
    PPD_ENVS: ['envs/env.yaml'],
    tests: ['main'],
    debugMode: true,
  });
};

try {
  run();
} catch (error) {
  console.log(error)
}
