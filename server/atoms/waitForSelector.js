const Test = require('../abstractTest');

const runTest = async function ({env, browser, page, data, selectors, log}) {
  await page.waitForSelector( selectors.sel, {
    visible: true
  } );
  await log({ text: `waitForSelector ${selectors.sel}` });
}

const test = new Test(
  {
    name: 'waitForSelector',
    type: 'atom',
    envNames: ['cloud', 'electron'],
    needSelectors: ['sel'],
    runTest: runTest,
  }
)

module.exports = test.run;