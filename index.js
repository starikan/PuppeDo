const { login } = require('./tests');
const { log } = require('./logger/logger');
const { getFullDepthJSON } = require('./yaml/yaml2json');
const { getTest } = require('./yaml/getTest');

const envs = require('./env.js');

const debugOnError = true;
if (debugOnError){
  envs.set('debugOnError', debugOnError);
}

// const test = async () => {
  // envs.setEnv('cloud');
  // await login();
  //   await typeInput({ text: 'Печенье', selCSS: '#Spwares_search_data' }, { isScreenshot: true });
  //   await buttonClick({ selCSS: '#search_start' }, { isScreenshot: true });
  //   await wait({ selector: '.cursor_wait', selectorHidden: true });
  //   await log({ text: 'Товар отфильтрован', isScreenshot: true });
  // await envs.closeBrowsers()
// }

const main = async () => {
  await envs.init();
  envs.setEnv('cloud');
  console.log(envs)
  const full = await getFullDepthJSON(envs.get('args.testFile'));
  const test = getTest(full);
  console.log(full, test);
  // debugger;
  await test();
  await envs.closeBrowsers()
}

try {
  main();
} catch (error) {
}

process.on('unhandledRejection', async (error, p) => {
  await log({ text: `Global: ${error.message}`, level: 'error', isScreenshot: true })
  process.exit(1);
});