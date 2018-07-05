const { login } = require('./tests');
const { log } = require('./logger/logger');

const envs = require('./env.js');

const debugOnError = true;
if (debugOnError){
  envs.set('debugOnError', debugOnError);
}

const test = async () => {
  envs.setEnv('cloud');
  await login();
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