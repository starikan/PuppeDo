const runServer = require('./server');

require('@puppedo/atoms');
const ppd = require('../index');

const run = async () => {
  await ppd.run({
    PPD_ROOT: 'tests',
    PPD_TESTS: 'screencast',
    PPD_DEBUG_MODE: true,
  });
};

try {
  runServer();
  run();
} catch (error) {
  console.log(error);
}
