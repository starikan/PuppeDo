const Test = require('../abstractTest');

const runTest = async function ({env, browser, page, data, selectors, log}) {
  await log({ 
    text: `Нажат селектор = ${selectors.selector}`,
    screenshot: true,
    fullpage: false,
    selCSS: [selectors.selector],
    level: 'debug'
  });
  await page.click(selectors.selector);
}

const test = new Test(
  {
    name: 'clickSelector',
    type: 'atom',
    needEnv: ['cloud'],
    needSelectors: ['selector'],
    runTest: runTest,
  }
)

module.exports = test.run;