const { log } = require('../logger/logger');
const Test = require('../abstractTest');

// const runTest = async function ({env, browser, page, data, selectors}) {
//   // await page.type(selectors.input, data.text);
// }

const beforeTest = async function ({data}) {
  await log({ 
    text: `IF`,
    // screenshot: true,
    // fullpage: false,
    // selCSS: [selectors.input],
    level: 'debug'
  });
}

const errorTest = async function() {}

const test = new Test(
  {
    name: 'if',
    type: 'atom'
  }
)

module.exports = test.run;