module.exports = {
  runTest: async function(args) {
    const { envs, data, log, options, levelIndent, _ } = args;
    const screenshot = _.get(options, 'screenshot', false);

    const name = data.name;
    envs.set('current.page', name);

    await log({
      text: `Переключились на страницу ${name}`,
      screenshot: screenshot,
      fullpage: true,
      level: 'raw',
      levelIndent: levelIndent + 1,
    });
  },
};
