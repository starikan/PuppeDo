const { log } = require('../logger/logger');
const Test = require('../abstractTest');

const beforeTest = async function ({env, browser, page, data, selectors}) {
  await log({ 
    text: `Проверка наличия селектора = ${selectors.selector}`,
    level: 'raw'
  });
}

const runTest = async function ({env, browser, page, data, selectors}) {
  let selector = await page.$(selectors.selector);
  if (selector) {
    console.log(selector)
  }
  else {
    console.log('No', selector)
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
    needData: ['selector'],

    beforeTest: beforeTest,
    runTest: runTest,
    afterTest: afterTest,
    errorTest: errorTest,
  }
)

module.exports = test.run;