// var CSON = require('cson')
// const cson = CSON.load('./test.cson');

// const env = require('./env');

const { typeInput, buttonClick, init, start, end, log, wait } = require('./helpers');

const { login } = require('./tests');

const findWare = async () => {
  await init({ name: 'findWare' });
  await start();
  await login();
    await typeInput({ text: 'Печенье', selCSS: '#Spwares_search_data', isScreenshot: true });
    await buttonClick({ selCSS: '#search_start', isScreenshot: true });
    await wait({ selector: '.cursor_wait', selectorHidden: true });
    await log({ text: 'Товар отфильтрован', isScreenshot: true });
  await end();
}

findWare();