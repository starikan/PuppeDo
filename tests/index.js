require('@puppedo/atoms');
const ppd = require('../index');

const run = async () => {
  // Test with direct run from JS
  await ppd.main({
    PPD_ROOT: 'tests',
    PPD_DATA: {
      PPD_DATA: 'BAZ',
    },
    PPD_SELECTORS: {
      PPD_SELECTORS: 'DDD',
    },
    PPD_ENVS: ['mainEnv'],
    PPD_TESTS: ['main', 'subTest'],
    PPD_DEBUG_MODE: true,
  });
};

try {
  run();
} catch (error) {
  console.log(error);
}
