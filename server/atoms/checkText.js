module.exports = {
  runTest: async function ({env, browser, page, data, selectors, results, log}) {
    const text = data.text;
    const selector = selectors.selector;

    const element = page.$(selector);
    const elementText = element.getProperty('textContent');


    if (elementText == text) {
      await log({
        text: `Текст '${text}' найден в элементе '${selector}'`,
        screenshot: true,
        selCSS: [selector],
        level: 'raw'
      });
    }

    else {
      await log({
        text: `Текст '${text}' НЕ найден в элементе '${selector}'`,
        screenshot: true,
        selCSS: [selector],
        level: 'raw'
      });
    }

  }
};