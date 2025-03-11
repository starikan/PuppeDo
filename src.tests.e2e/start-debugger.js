const ppd = require('../index');

const run = async () => {
  ppd.run({
    PPD_TESTS: 'main',
    PPD_DEBUG_MODE: 'true',
  });

  console.log(
    `
  ┏┓┏┓┏┓  ┏┓┏┓┏┓┏┓
  ┣ ┏┛┣   ┃┃┣┫┗┓┗┓
  ┗┛┗━┗┛  ┣┛┛┗┗┛┗┛`,
  );
};

run();
