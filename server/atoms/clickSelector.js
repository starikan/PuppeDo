const Test = require('../abstractTest');

const runTest = async function ({env, browser, page, data, selectors, log}) {
  const sel = selectors.selector;

  await log({
    text: `Нажат селектор = ${sel}`,
    screenshot: true,
    fullpage: false,
    selCSS: [sel],
    level: 'debug'
  });
  let element = await page.$(sel)
  await element.click(sel)
}

const test = new Test(
  {
    name: 'clickSelector',
    type: 'atom',
    needEnv: ['cloud', 'electron'],
    needSelectors: ['selector'],
    runTest: runTest,
  }
)

module.exports = test.run;