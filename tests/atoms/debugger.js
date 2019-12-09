module.exports = {
  runTest: async function(args) {
    const { page, log, levelIndent } = args;
    await log({
      text: 'DEBUG PAGE',
      screenshot: false,
      levelIndent: levelIndent + 1,
    });
    await page.evaluate(() => {
      debugger;
    });
  },
};
