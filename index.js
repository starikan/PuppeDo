const _ = require('lodash');

const { getFullDepthJSON } = require('./yaml/getFullDepthJSON');
const { getTest } = require('./yaml/getTest');
const { args_ext } = require('./helpers');

const main = async (args = {}) => {
  let testsList = process.env.PPD_TESTS_LIST ? JSON.parse(process.env.PPD_TESTS_LIST) : _.get(args, 'testsList') || JSON.parse(_.get(args_ext, '--testsList', '[]'));

  process.on('unhandledRejection', async (error, p) => {
    console.log('unhandledRejection')
    console.log(error, p)
    if (process.env.PPD_DEBUG_MODE) debugger;
    process.exit(1);
  });

  const { envsId, envs, log } = require('./env')();

  await envs.init(args);

  if (_.isEmpty(testsList)) testsList = [envs.get('args.testFile')];

  for (let i = 0; i < testsList.length; i++) {
    const testFile = testsList[i];
    const fullJSON = getFullDepthJSON({
      envs: envs,
      filePath: testFile,
    });
    let test = getTest(fullJSON, envsId);
    await test();
  }

  await envs.closeBrowsers()
}

if (!module.parent) {
  main();
} else {
  exports.main = main;
}
