module.exports = {
  runTest: async function(args) {
    const { page, selectors, data, log, options, helper, levelIndent, _ } = args;
    const selector = helper.anyGet(selectors, 'selector');
    const screenshot = _.get(options, 'screenshot', false);
    const dX = data.dX;
    const dY = data.dY;

    const element = await helper.getElement(page, selector);
    const boxElement = await element.boundingBox();
    const elementX = await boxElement.x;
    const elementY = await boxElement.y;

    const mouse = page.mouse;
    await mouse.move(elementX + dX, elementY + dY);

    await log({
      text: `Мышь перемещена на селектор ${selector} со смещением от верхнего левого угла dX = ${dX}, dY = ${dY}`,
      screenshot: screenshot,
      fullpage: false,
      level: 'raw',
      levelIndent: levelIndent + 1,
    });
  },
};
