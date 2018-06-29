// var CSON = require('cson')
// const cson = CSON.load('./test.cson');


// const { initTest, start, end, wait } = require('./helpers');
// const { typeInput, buttonClick, goTo } = require('./atoms')
// const { login } = require('./tests');
const { goTo } = require('./atoms')
const { log } = require('./logger/logger');

const env = require('./env.js');
console.log(log)
// const Test = require('./abstractTest');
// new Test();

const test = async () => {
  env.setEnv('cloud');
  await log({screenshot: true, stdOut: true})
  // console.log(env)
  await goTo()
  // await test();
  // await goTo({  })
  // await log({ level: 'env' });
  // await login();
  //   await typeInput({ text: 'Печенье', selCSS: '#Spwares_search_data' }, { isScreenshot: true });
  //   await buttonClick({ selCSS: '#search_start' }, { isScreenshot: true });
  //   await wait({ selector: '.cursor_wait', selectorHidden: true });
  //   await log({ text: 'Товар отфильтрован', isScreenshot: true });
  debugger;
  await env.closeBrowsers()
}

const main = async () => {
  await env.init();
  // Тут генерация теста из yaml
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