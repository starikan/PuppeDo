const _ = require('lodash');
const Test = require('../abstractTest');

const runTest = async function ({options, browser, page, data, log}) {
  await page.waitForNavigation({ waitUntil: _.get(options, 'waitUntil', 'load') });
  await log({ text: `waitLoadPage` });
}

const test = new Test(
  {
    name: 'waitLoadPage',
    type: 'atom',
    envNames: ['cloud', 'electron'],
    runTest: runTest,
  }
)

module.exports = test.run;