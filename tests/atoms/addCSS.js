module.exports = {
  runTest: async function(args) {
    const { page, data, log, levelIndent, _ } = args;

    const css = _.get(data, 'css');

    await page.addStyleTag({ content: css });
    await log({
      text: `Добавлен CSS на страницу ${css}`,
      screenshot: false,
      level: 'raw',
      levelIndent: levelIndent + 1,
    });
  },
};
