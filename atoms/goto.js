
// const { log } = require('../logger/logger');
const env = require('../env');
const Test = require('../abstractTest');

const test = new Test(
  {
    name: 'goTo',
    type: 'atom',
    runTest: async function(){
      // console.log(this)
    }
  }
)

console.log(test.run)
// async function goTo(
//   { 
//     data = [],
//     url = ''
//   } = {}, 
//   {
//     waitTime = 0, 
//     isScreenshot = false, 
//     isFullScreenshot = false,
//   } = {}
// ) {
//   // let browser = env.getCurr();
//   // let baseUrl = browser.data.baseUrl + url;

//   // if (browser.page && baseUrl) {
//   //   await browser.page.goto(baseUrl);
//   //   await log({ text: `Go to: ${baseUrl}` });
//   // }
// };

module.exports = {
  goTo: test.run
};