// var CSON = require('cson')
// const cson = CSON.load('./test.cson');

// const env = require('./env');

const { init, start, end, wait } = require('./helpers');
const { typeInput, buttonClick } = require('./atoms')
const { login } = require('./tests');
const { log } = require('./logger/logger');

const findWare = async () => {
  await init({ name: 'findWare' });
  await start();
  await login();
    await typeInput({ text: 'Печенье', selCSS: '#Spwares_search_data' }, { isScreenshot: true });
    await buttonClick({ selCSS: '#search_start' }, { isScreenshot: true });
    await wait({ selector: '.cursor_wait', selectorHidden: true });
    await log({ text: 'Товар отфильтрован', isScreenshot: true });
  await end();
}

try {
  findWare();
} catch (error) {
}

process.on('unhandledRejection', async (error, p) => {
  await log({ text: `Global: ${error.message}`, type: 'error', isScreenshot: true })
  process.exit(1);
});