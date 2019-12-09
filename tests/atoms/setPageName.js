module.exports = {
  runTest: async function(args) {
    const { env, data, browser, log, options, levelIndent, _ } = args;
    const screenshot = _.get(options, 'screenshot', false);

    const position = _.get(data, 'position');
    const name = _.get(data, 'name');

    const allPages = await browser.pages();
    if (['last', -1].includes(position)) {
      console.log(env.set(`state.pages.${name}`, allPages[allPages.length - 1]));
    } else if (_.isNumber(position)) {
      env.set(`state.pages.${name}`, allPages[position]);
    }

    await log({
      text: `Переключились на страницу ${name}`,
      screenshot: screenshot,
      fullpage: true,
      level: 'raw',
      levelIndent: levelIndent + 1,
    });
  },
};
