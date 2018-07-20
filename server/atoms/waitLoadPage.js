
const Test = require('../abstractTest');

const runTest = async function ({env, browser, page, data, log}) {
  await page.waitForNavigation({ waitUntil: 'load' });
  await log({ text: `waitLoadPage` });
}

const test = new Test(
  {
    name: 'waitLoadPage',
    type: 'atom',
    envNames: ['cloud'],
    runTest: runTest,
  }
)

module.exports = test.run;