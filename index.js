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
  const full = getFullDepthJSON({
    envs: envs,
    filePath: envs.get('args.testFile'),
  });
  let test = getTest(full, envsId);
  await test();
  await envs.closeBrowsers()
}

if (!module.parent) {
  // ran with `node something.js`
  main();
} else {
  exports.main = main;
}
