module.exports = {
  runTest: async function(args) {
    const { page, selectors, data, log, options, helper, levelIndent, _ } = args;
    const selector = helper.anyGet(selectors, 'selector');
    const screenshot = _.get(options, 'screenshot', false);
    const element = await helper.getElement(page, selector);
    const X = data.X;
    const Y = data.Y;

    const mouse = page.mouse;
    await mouse.click(X, Y);

    await log({
      text: `Мышь кликнула по странице в координатах X = ${X}, Y = ${Y}`,
      screenshot: screenshot,
      fullpage: false,
      element: element,
      level: 'raw',
      levelIndent: levelIndent + 1,
    });
  },
};
