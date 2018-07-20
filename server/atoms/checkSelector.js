const Test = require('../abstractTest');

const beforeTest = async function ({env, browser, page, data, selectors, log}) {
  await log({ 
    text: `Проверка наличия селектора = ${selectors.selector}`,
    screenshot: false,
    level: 'raw'
  });
}

const runTest = async function ({env, browser, page, data, selectors, results, log}) {
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

const test = new Test(
  {
    name: 'checkSelector',
    type: 'atom',
    needEnv: ['cloud'],
    needSelectors: ['selector'],
    allowResults: ['exists'],

    beforeTest: beforeTest,
    runTest: runTest,
  }
)

module.exports = test.run;