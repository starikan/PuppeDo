const Test = require('../abstractTest');

const runTest = async function ({env, browser, page, data, log}) {
  await page.waitFor( data.time );
  await log({ text: `waitTime ${data.time}ms`, level: 'debug' });
}

const test = new Test(
  {
    name: 'waitTime',
    type: 'atom',
    envNames: ['cloud'],
    needData: ['time'],
    runTest: runTest,
  }
)

module.exports = test.run;