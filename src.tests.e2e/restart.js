require('@puppedo/atoms');

const run = async () => {
  for (let i = 0; i < 2; i += 1) {
    // eslint-disable-next-line global-require
    const ppd = require('../index');

    await ppd.run(
      {
        PPD_TESTS: 'runnerRunClose',
      },
      { closeProcess: false },
    );
  }
};

run();
