require('@puppedo/atoms');
const ppd = require('../index');
const runServer = require('./server');

const run = async () => {
  runServer();
  await ppd.run({
    PPD_TESTS: ['main', 'subTest'],
    PPD_DEBUG_MODE: 'true',
    PPD_DATA: {
      PPD_DATA: 'BAZ',
      myEnv: 'mainRunner',
    },
    PPD_SELECTORS: {
      PPD_SELECTORS: 'DDD',
    },
    PPD_LOG_SCREENSHOT: true,
    PPD_LOG_FULLPAGE: true,
    PPD_LOG_TIMER_SHOW: false,
    PPD_LOG_TIMESTAMP_SHOW: false,
  });

  console.log(
    `
  ┏┓┏┓┏┓  ┏┓┏┓┏┓┏┓
  ┣ ┏┛┣   ┃┃┣┫┗┓┗┓
  ┗┛┗━┗┛  ┣┛┛┗┗┛┗┛`,
  );
};

run();
