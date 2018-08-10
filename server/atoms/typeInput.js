module.exports = {
  runTest: async function (args) {
    const { page, data, selectors } = args;
    await page.type(selectors.input, data.text);
  },
  afterTest: async function (args) {
    const { data, selectors, log } = args;
    await log({
      text: `Ввод текста в INPUT = ${selectors.input}, TEXT = ${data.text}`,
      screenshot: true,
      fullpage: false,
      selCSS: [selectors.input],
      level: 'debug'
    });
  }
};