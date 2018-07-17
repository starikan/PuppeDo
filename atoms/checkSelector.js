const { log } = require('../logger/logger');
const Test = require('../abstractTest');

const beforeTest = async function ({env, browser, page, data, selectors}) {
  await log({ 
    text: `Проверка наличия селектора = ${selectors.selector}`,
    level: 'raw'
  });
}

const runTest = async function ({env, browser, page, data, selectors, results}) {
  let selector = await page.$(selectors.selector);
  if (selector) {
    await log({ 
      text: `Селектор найден = ${selectors.selector}`,
      level: 'raw'
    });
    return {
      exists: true
    }
  }
  else {
    await log({ 
      text: `Селектор НЕ найден = ${selectors.selector}`,
      level: 'raw'
    });
    return {
      exists: false
    }
  }
}

const afterTest = async function ({env, browser, page, data, selectors}) {}

const errorTest = async function() {}

const test = new Test(
  {
    name: 'checkSelector',
    type: 'atom',
    needEnv: ['cloud'],
    needSelectors: ['selector'],
    allowResults: ['exists'],

    beforeTest: beforeTest,
    runTest: runTest,
    afterTest: afterTest,
    errorTest: errorTest,
  }
)

module.exports = test.run;