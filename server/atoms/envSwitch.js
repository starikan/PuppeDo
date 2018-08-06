const Test = require('../abstractTest');

const runTest = async function ({env, envs, browser, page, data, selectors, log}) {
  const sel = selectors.selector;

  await log({
    text: `Переключение среды = ${data.envName}`,
    screenshot: false,
    fullpage: false,
    level: 'debug'
  });
  await envs.setEnv(data.envName);
}

const test = new Test(
  {
    name: 'envSwitch',
    type: 'atom',
    needData: ['envName'],
    runTest: runTest,
  }
)

module.exports = test.run;