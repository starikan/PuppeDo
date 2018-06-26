// var CSON = require('cson')
// const cson = CSON.load('./test.cson');


const { initTest, start, end, wait } = require('./helpers');
const { typeInput, buttonClick, goTo } = require('./atoms')
const { login } = require('./tests');
const { log } = require('./logger/logger');

const test = async () => {}

const main = async () => {
  const env = await require('./env.js')();
  console.log(1)
  await test();
  await env.closeBrowsers()
  // await initTest({ name: 'findWare',  });
  // await start({ envName: 'cloud' });
  // await goTo({  })
  // await log({ level: 'env' });
  // await login();
  //   await typeInput({ text: 'Печенье', selCSS: '#Spwares_search_data' }, { isScreenshot: true });
  //   await buttonClick({ selCSS: '#search_start' }, { isScreenshot: true });
  //   await wait({ selector: '.cursor_wait', selectorHidden: true });
  //   await log({ text: 'Товар отфильтрован', isScreenshot: true });
  // await end({ envName: 'cloud' });
}

try {
  main();
} catch (error) {
}

process.on('unhandledRejection', async (error, p) => {
  await log({ text: `Global: ${error.message}`, level: 'error', isScreenshot: true })
  process.exit(1);
});