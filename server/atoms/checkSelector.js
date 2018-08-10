module.exports = {
  beforeTest: async function ({env, browser, page, data, selectors, log}) {
    await log({
      text: `Проверка наличия селектора = ${selectors.selector}`,
      screenshot: false,
      level: 'raw'
    })
  },
  runTest: async function ({env, browser, page, data, selectors, results, log}) {
    let selector = await page.$(selectors.selector);
    if (selector) {
      await log({
        text: `Селектор найден = ${selectors.selector}`,
        screenshot: false,
        level: 'raw'
      });
      return {
        exists: true
      }
    }
    else {
      await log({
        text: `Селектор НЕ найден = ${selectors.selector}`,
        screenshot: false,
        level: 'raw'
      });
      return {
        exists: false
      }
    }
  }
};