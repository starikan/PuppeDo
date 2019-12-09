module.exports = {
  runTest: async function(args) {
    const { page, data, log, levelIndent, _ } = args;

    const js = _.get(data, 'js');

    const dataEval = await page.evaluate(js);
    await log({
      text: `Выполнение кода JS: ${js}`,
      screenshot: false,
      level: 'raw',
      levelIndent: levelIndent + 1,
    });

    return { data: dataEval };
  },
};
