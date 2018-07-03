
const { log } = require('../logger/logger');
const Test = require('../abstractTest');

const beforeTest = async function ({}) {
  // console.log('beforeTest')
}

const runTest = async function ({env, browser, page, data}) {
  await page.goto(data.url);
  await log({ text: `Go to: ${data.url}` });
}

const afterTest = async function ({}) {
  // console.log('afterTest')
}

const errorTest = async function() {

}

const test = new Test(
  {
    name: 'goTo',
    type: 'atom',
    envNames: ['cloud'],
    bindData: {'url': 'baseUrl'},
    beforeTest: beforeTest,
    runTest: runTest,
    afterTest: afterTest,
    errorTest: errorTest,
  }
)

module.exports = test.run;