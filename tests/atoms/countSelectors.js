module.exports = {
  runTest: async function(args) {
    const { page, selectors, options, log, helper, levelIndent } = args;
    const selector = helper.anyGet(selectors, 'selector');

    const timeDellay = helper.anyGet(options, 'timeDellay');
    if (timeDellay) {
      await page.waitFor(timeDellay);
    }

    await log({
      text: `Подсчет количества селекторов = ${selectors.selector}`,
      screenshot: false,
      level: 'raw',
      levelIndent: levelIndent + 1,
    });

    const elements = await helper.getElement(page, selector, true);

    await log({
      text: `Селекторов ${selectors.selector} найдено = ${elements.length}`,
      screenshot: false,
      level: 'raw',
      levelIndent: levelIndent + 1,
    });

    return {
      count: elements.length,
    };
  },
};
