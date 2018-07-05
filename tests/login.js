const { log } = require('../logger/logger');
const Test = require('../abstractTest');
const { goTo, typeInput, buttonClick } = require('../atoms')

const beforeTest = async function ({}) {
  await log({ 
    text: `TEST LOGIN START`,
    screenshot: true,
    fullpage: true,
    level: 'test'
  });
}

const runTest = async function ({}) {
  await goTo({
    bindData: {url: 'baseUrl'}
  })
  await typeInput({
    bindData: { text: 'auth.login'},
    bindSelectors: { input: 'auth.inputLogin' }
  });
  await typeInput({
    bindData: { text: 'auth.password'},
    bindSelectors: { input: 'auth.inputPassword' }
  });
  await buttonClick({
    bindSelectors: { button: 'auth.submit' }
  });
}

const afterTest = async function ({}) {
  await log({ 
    text: `TEST LOGIN END`,
    screenshot: true,
    fullpage: true,
    level: 'test'
  });
}

const errorTest = async function() {}

const test = new Test(
  {
    name: 'login',
    type: 'test',
    needEnv: ['cloud'],
    needData: ['baseUrl', 'auth.login', 'auth.password'],
    needSelectors: ['auth.inputLogin', 'auth.inputPassword', 'auth.submit'],
    beforeTest: beforeTest,
    runTest: runTest,
    afterTest: afterTest,
    errorTest: errorTest,
  }
)

module.exports = test.run;