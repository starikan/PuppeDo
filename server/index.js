const { getFullDepthJSON } = require('./yaml/getFullDepthJSON');
const { getTest } = require('./yaml/getTest');

const main = async (args = {}) => {

  process.on('unhandledRejection', async (error, p) => {
    console.log('unhandledRejection')
    console.log(error, p)
    debugger
    process.exit(1);
  });

  const { envsId, envs, log } = require('./env')();
  const debugOnError = true;
  if (debugOnError){
    envs.set('debugOnError', debugOnError);
  }

  await envs.init(args);
  const full = await getFullDepthJSON({
    envs: envs,
    filePath: envs.get('args.testFile'),
  });
  let test = getTest(full, envsId);
  await test();
  await envs.closeBrowsers()
}

exports.main = main;

// try {
//   main();
// }
// catch (error) {}