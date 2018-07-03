const { log } = require('../logger/logger');
const Test = require('../abstractTest');

const beforeTest = async function ({}) {}

const runTest = async function ({env, browser, page, data, selectors}) {
  await page.click(selectors.button);
}

const afterTest = async function ({env, browser, page, data, selectors}) {
  await log({ 
    text: `Нажата кнопка = ${selectors.button}`,
    screenshot: true,
    fullpage: false,
    selCSS: [selectors.button],
    level: 'debug'
  });
}

const errorTest = async function() {}

const test = new Test(
  {
    name: 'buttonClick',
    type: 'atom',
    needEnv: ['cloud'],
    needSelectors: ['button'],
    beforeTest: beforeTest,
    runTest: runTest,
    afterTest: afterTest,
    errorTest: errorTest,
  }
)

module.exports = test.run;


// const env = require('../env')

// const { log } = require('../logger/logger');

// async function buttonClick(
//   { 
//     data = [],
//     selCSS = "", 
//     selXPath = "", 
//   } = {}, 
//   {
//     repeat = 1,
//     pageNum = 0, 
//     waitTime = 0, 
//     isScreenshot = false, 
//     isFullScreenshot = false,
//   } = {}
// ) {
//   page = env.get(`pages.${pageNum}`);
//   if (page) {
//     await log({ 
//       text: `Нажата кнопка ${selCSS}`, 
//       selCSS: [selCSS], 
//       isScreenshot: isScreenshot, 
//       isFullScreenshot: isFullScreenshot,
//       level: 'debug'
//      });
//     await page.click(selCSS);
//   }
// };

// module.exports = buttonClick;