module.exports = {
  runTest: async function (args) {
    const { page, data, log } = args;
    await page.goto(data.url);
    await log({ text: `Go to: ${data.url}` });
  }
};

// const Test = require('../abstractTest');

// const runTest = async function ({env, browser, page, data, log}) {
//   await page.goto(data.url);
//   await log({ text: `Go to: ${data.url}` });
// }

// const test = new Test(
//   {
//     name: 'goTo',
//     type: 'atom',
//     envNames: ['cloud'],
//     needData: ['url'],
//     runTest: runTest,
//   }
// )

// module.exports = test.run;