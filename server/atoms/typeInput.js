const Test = require('../abstractTest');

const runTest = async function ({env, browser, page, data, selectors, log}) {
  await page.type(selectors.input, data.text);
}

const afterTest = async function ({env, browser, page, data, selectors, log}) {
  await log({ 
    text: `Ввод текста в INPUT = ${selectors.input}, TEXT = ${data.text}`,
    screenshot: true,
    fullpage: false,
    selCSS: [selectors.input],
    level: 'debug'
  });
}

const test = new Test(
  {
    name: 'typeInput',
    type: 'atom',
    needEnv: ['cloud'],
    needSelectors: ['input'],
    needData: ['text'],
    runTest: runTest,
    afterTest: afterTest,
  }
)

module.exports = test.run;