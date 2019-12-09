module.exports = {
  runTest: async function(args) {
    const { page, data, log, levelIndent, _ } = args;

    const js = _.get(data, 'js');
    const jsFile = _.get(data, 'jsFile');

    if (jsFile) {
      await page.addScriptTag({ path: jsFile });
      await log({
        text: `Добавлен JS на страницу ${jsFile}`,
        screenshot: false,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    } else if (js) {
      await page.addScriptTag({ content: js });
      await log({
        text: `Добавлен JS на страницу ${js}`,
        screenshot: false,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    }
  },
};
