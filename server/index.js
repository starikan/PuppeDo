// const { envs, log } = require('./env.js');
const { getFullDepthJSON } = require('./yaml/getFullDepthJSON');
const { getTest } = require('./yaml/getTest');

// await typeInput({ text: 'Печенье', selCSS: '#Spwares_search_data' }, { isScreenshot: true });
// await buttonClick({ selCSS: '#search_start' }, { isScreenshot: true });
// await wait({ selector: '.cursor_wait', selectorHidden: true });
// await log({ text: 'Товар отфильтрован', isScreenshot: true });

const main = async () => {

  const { envsId, envs, log } = require('./env.js')();

  const debugOnError = true;
  if (debugOnError){
    envs.set('debugOnError', debugOnError);
  }

  await envs.init();
  envs.setEnv('cloud');
  const full = await getFullDepthJSON({
    envs: envs,
    filePath: envs.get('args.testFile'),
  });
  let test = getTest(full, envsId);
  await test();
  await envs.closeBrowsers()
}

try {
  main();
} 
catch (error) {}

process.on('unhandledRejection', async (error, p) => {
  // console.log('unhandledRejection')
  // const { envsId, envs, log } = require('./env.js')();
  // console.log(error.envsId)
  // await log({ text: `Global: ${error.message} |||| ${error.stack}`, level: 'error', isScreenshot: true })
  // debugger;
  process.exit(1);
});