module.exports = {
  runTest: async function(args) {
    const { page, data, selectors, helper } = args;
    const selector = selectors.input;
    const text = data.text;
    const element = await helper.getElement(page, selector);
    await element.type(text);
  },

  afterTest: async function(args) {
    const { page, data, selectors, options, log, helper, levelIndent, _ } = args;
    const screenshot = _.get(options, 'screenshot', false);
    const selector = selectors.input;
    const text = data.text;
    const element = await helper.getElement(page, selector);

    await log({
      text: `Ввод текста в INPUT = ${selector}, TEXT = ${text}`,
      screenshot: screenshot,
      fullpage: false,
      element: element,
      level: 'debug',
      levelIndent: levelIndent + 1,
    });
  },
};
