const ppd = require('../index');

const run = async () => {
  // Test with direct run from JS
  await ppd.main({
    PPD_ROOT: 'tests',
    PPD_ENVS: ['mainEnv'],
    PPD_TESTS: ['main'],
    PPD_DEBUG_MODE: true,
  });
};

try {
  run();
} catch (error) {
  console.log(error);
}
