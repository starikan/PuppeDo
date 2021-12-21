require('@puppedo/atoms');

const run = async () => {
  for (let i = 0; i < 2; i += 1) {
    const ppd = require('../index');

    await ppd.run(
      {
        PPD_TESTS: 'envRunClose',
      },
      { closeProcess: false },
    );
  }
};

run();
