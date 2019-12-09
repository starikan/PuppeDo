module.exports = {
  runTest: async function(args) {
    const { page, selectors, data, log, options, helper, levelIndent, _ } = args;
    const selector = helper.anyGet(selectors, 'selector');
    const option = helper.anyGet(data, 'option');
    const screenshot = _.get(options, 'screenshot', true);
    const element = await helper.getElement(page, selector);

    await page.select(selector, option);

    await log({
      text: `Выбран селектор = ${selector}`,
      screenshot: screenshot,
      fullpage: false,
      element: element,
      level: 'debug',
      levelIndent: levelIndent + 1,
    });
  },
};
