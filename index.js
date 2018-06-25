// var CSON = require('cson')
// const cson = CSON.load('./test.cson');

// const env = require('./env');

const { initTest, start, end, wait } = require('./helpers');
const { typeInput, buttonClick, goTo } = require('./atoms')
const { login } = require('./tests');
const { log } = require('./logger/logger');

const findWare = async () => {
  await initTest({ name: 'findWare',  });
  await start({ envName: 'cloud' });
  await goTo({  })
  await log({ level: 'env' });
  // await login();
  //   await typeInput({ text: 'Печенье', selCSS: '#Spwares_search_data' }, { isScreenshot: true });
  //   await buttonClick({ selCSS: '#search_start' }, { isScreenshot: true });
  //   await wait({ selector: '.cursor_wait', selectorHidden: true });
  //   await log({ text: 'Товар отфильтрован', isScreenshot: true });
  // await end({ envName: 'cloud' });
}

try {
  findWare();
} catch (error) {
}

process.on('unhandledRejection', async (error, p) => {
  await log({ text: `Global: ${error.message}`, level: 'error', isScreenshot: true })
  process.exit(1);
});