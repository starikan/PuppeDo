module.exports = {
  runTest: async function(args) {
    const { page, selectors, data, log, helper, levelIndent } = args;

    const text = data.text;
    const selector = selectors.selector;

    const element = await helper.getElement(page, selector);
    const elementText = element.innerText;

    if (elementText === text) {
      await log({
        text: `Текст '${text}' найден в элементе '${selector}'`,
        screenshot: true,
        element: element,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    } else {
      await log({
        text: `Текст '${text}' НЕ найден в элементе '${selector}'`,
        screenshot: true,
        element: element,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    }

    return {
      exists: elementText === text,
    };
  },
};
