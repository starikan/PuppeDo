module.exports = {
  runTest: async function(args) {
    const { page, log, options, _, levelIndent, data } = args;
    const screenshot = _.get(options, 'screenshot', false);
    const count = _.get(options, 'count', 1);

    const key = _.get(data, 'key', false);
    const modificator = _.get(data, 'modificator', false);
    const modificator1 = _.get(data, 'modificator1', false);
    const modificator2 = _.get(data, 'modificator2', false);
    if (modificator) {
      await page.keyboard.down(modificator);
    }
    if (modificator1) {
      await page.keyboard.down(modificator1);
    }
    if (modificator2) {
      await page.keyboard.down(modificator2);
    }

    for (let i = 0; i < count; i++) {
      await page.keyboard.press(key);
    }

    if (modificator) {
      await page.keyboard.up(modificator);
    }
    if (modificator1) {
      await page.keyboard.up(modificator1);
    }
    if (modificator2) {
      await page.keyboard.up(modificator2);
    }

    await log({
      text: `Нажаты клавиши = ${modificator ? modificator + '+' : ''}${modificator1 ? modificator1 + '+' : ''}${
        modificator2 ? modificator2 + '+' : ''
      }${key}`,
      screenshot: screenshot,
      fullpage: false,
      level: 'debug',
      levelIndent: levelIndent + 1,
    });
  },
};
