// var CSON = require('cson')
// const cson = CSON.load('./test.cson');

// const { initTest, start, end, wait } = require('./helpers');
// const { typeInput, buttonClick, goTo } = require('./atoms')
// const { login } = require('./tests');
const { goTo, typeInput } = require('./atoms')
const { log } = require('./logger/logger');

const envs = require('./env.js');

const debugOnError = true;
if (debugOnError){
  envs.set('debugOnError', debugOnError);
}

const test = async () => {
  envs.setEnv('cloud');
  // await log({screenshot: true, stdOut: true})
  // console.log(env)
  await goTo()
  await typeInput({
    bindData: { text: 'auth.login'},
    bindSelectors: { input: 'auth.inputLogin' }
  });
  await typeInput({
    bindData: { text: 'auth.password'},
    bindSelectors: { input: 'auth.inputPassword' }
  });
  // await test();
  // await goTo({  })
  // await log({ level: 'env' });
  // await login();
  //   await typeInput({ text: 'Печенье', selCSS: '#Spwares_search_data' }, { isScreenshot: true });
  //   await buttonClick({ selCSS: '#search_start' }, { isScreenshot: true });
  //   await wait({ selector: '.cursor_wait', selectorHidden: true });
  //   await log({ text: 'Товар отфильтрован', isScreenshot: true });
  await envs.closeBrowsers()
}

const main = async () => {
  await envs.init();
  //TODO: 2018-07-03 S.Starodubov Тут генерация теста из yaml
  await test();
}

try {
  main();
} catch (error) {
}

process.on('unhandledRejection', async (error, p) => {
  await log({ text: `Global: ${error.message}`, level: 'error', isScreenshot: true })
  process.exit(1);
});