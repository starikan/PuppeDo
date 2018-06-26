// var CSON = require('cson')
// const cson = CSON.load('./test.cson');


const { initTest, start, end, wait } = require('./helpers');
const { typeInput, buttonClick, goTo } = require('./atoms')
const { login } = require('./tests');
const { log } = require('./logger/logger');

const Test = require('./abstractTest');
new Test();

// const test = async () => {

// }

const main = async () => {
  const env = await require('./env.js')();
  console.log(1)
  // await test();
  // await goTo({  })
  // await log({ level: 'env' });
  // await login();
  //   await typeInput({ text: 'Печенье', selCSS: '#Spwares_search_data' }, { isScreenshot: true });
  //   await buttonClick({ selCSS: '#search_start' }, { isScreenshot: true });
  //   await wait({ selector: '.cursor_wait', selectorHidden: true });
  //   await log({ text: 'Товар отфильтрован', isScreenshot: true });
  await env.closeBrowsers()
}

try {
  main();
} catch (error) {
}

process.on('unhandledRejection', async (error, p) => {
  await log({ text: `Global: ${error.message}`, level: 'error', isScreenshot: true })
  process.exit(1);
});