require('@puppedo/atoms');
const ppd = require('../index');

const run = async () => {
  // Test with direct run from JS
  await ppd.run({
    PPD_ROOT: 'tests',
    PPD_TESTS: ['testDataCheck'],
    PPD_DATA: {
      CHECK_DATA: 'ARG_DATA',
    },
    PPD_DEBUG_MODE: true,
    PPD_LOG_LEVEL_NESTED: 0,
  });
};

try {
  run();
} catch (error) {
  console.log(error);
}
