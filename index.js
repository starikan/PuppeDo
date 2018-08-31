const { getFullDepthJSON } = require('./yaml/getFullDepthJSON');
const { getTest } = require('./yaml/getTest');

const main = async (args = {}) => {

  process.on('unhandledRejection', async (error, p) => {
    console.log('unhandledRejection')
    console.log(error, p)
    if (process.env.PPD_DEBUG_MODE) debugger;
    process.exit(1);
  });

  const { envsId, envs, log } = require('./env')();

  await envs.init(args);
  const fullJSON = getFullDepthJSON({
    envs: envs,
    filePath: envs.get('args.testFile'),
  });
  let test = getTest(fullJSON, envsId);
  await test();
  await envs.closeBrowsers()
}

if (!module.parent) {
  main();
} else {
  exports.main = main;
}
