const { log } = require('../logger/logger');
const Test = require('../abstractTest');

const beforeTest = async function ({}) {}

const runTest = async function ({env, browser, page, data, selectors}) {
  await page.type(selectors.input, data.text);
}

const afterTest = async function ({env, browser, page, data, selectors}) {
  await log({ 
    text: `Ввод текста в INPUT = ${selectors.input}, TEXT = ${data.text}`,
    screenshot: true,
    fullpage: false,
    selCSS: [selectors.input],
    level: 'debug'
  });
}

const errorTest = async function() {}

const test = new Test(
  {
    name: 'typeInput',
    type: 'atom',
    envNames: ['cloud'],
    needSelectors: ['input'],
    needData: ['text'],
    beforeTest: beforeTest,
    runTest: runTest,
    afterTest: afterTest,
    errorTest: errorTest,
  }
)

module.exports = test.run;