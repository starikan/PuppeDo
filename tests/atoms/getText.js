module.exports = {
  runTest: async function(args) {
    let selector, screenshot, element, attr, text, value, selectorSelect, elementSelect, tagName;
    try {
      const { page, selectors, data, log, options, helper, levelIndent, _ } = args;
      selector = helper.anyGet(selectors, 'selector');
      screenshot = _.get(options, 'screenshot', false);
      attr = helper.anyGet(data, 'attribute');
      element = await helper.getElement(page, selector);

      if (element) {
        ({ tagName, text, value } = await page.evaluate(element => {
          return { tagName: element.tagName, text: element.innerText, value: element.value };
        }, element));

        // Select fetch data
        if (value && !text && tagName === 'SELECT') {
          selectorSelect = selector + ` > option[value = "${value}"]`;
          elementSelect = await helper.getElement(page, selectorSelect);
          text = await page.evaluate(element => {
            return element.label;
          }, elementSelect);
        }

        // Input
        if (value && !text && tagName === 'INPUT') {
          text = value;
          value = '';
        }
      } else {
        throw { message: `Can't find selector ${selector}` };
      }

      await log({
        text: `Get text: '${text}' from selector: '${selector}'`,
        screenshot: screenshot,
        fullpage: false,
        element: element,
        level: 'debug',
        levelIndent: levelIndent + 1,
      });

      return { text, value };
    } catch (error) {
      error.testType = 'atom';
      error.testArgs = args;
      error.testVars = { selector, screenshot, element, attr, text, value, selectorSelect, elementSelect, tagName };
      throw error;
    }
  },
};
