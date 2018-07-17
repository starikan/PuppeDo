const Test = require('../abstractTest');

const runTest = async function ({env, browser, page, data, selectors, results}) {}

const test = new Test(
  {
    name: 'if',
    type: 'atom',
    runTest: runTest,
  }
)

module.exports = test.run;