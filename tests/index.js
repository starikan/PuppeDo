const ppd = require('../index');
const _ = require('lodash');

const run = async () => {
  // Test with direct run from JS
  await ppd.main({
    testsFolder: 'tests',
    tests: ['main'],
    envs: ['envs/env.yaml'],
    debugMode: true,
  });
};

try {
  run();
} catch (error) {
  console.log(error)
}
