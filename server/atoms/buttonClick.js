const Test = require('../abstractTest');

const runTest = async function ({env, browser, page, data, selectors, log}) {
  await log({ 
    text: `Нажата кнопка = ${selectors.button}`,
    screenshot: true,
    fullpage: false,
    selCSS: [selectors.button],
    level: 'debug'
  });
  await page.click(selectors.button);
}

const test = new Test(
  {
    name: 'buttonClick',
    type: 'atom',
    needEnv: ['cloud'],
    needSelectors: ['button'],
    runTest: runTest,
  }
)

module.exports = test.run;