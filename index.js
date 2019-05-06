const _ = require('lodash');

const { getFullDepthJSON } = require('./getFullDepthJSON');
const { getTest } = require('./getTest');
const { args_ext } = require('./helpers');

const main = async (args = {}) => {
  let testsList = process.env.PPD_TESTS_LIST
    ? JSON.parse(process.env.PPD_TESTS_LIST)
    : _.get(args, 'testsList') || JSON.parse(_.get(args_ext, '--testsList', '[]'));

  process.on('unhandledRejection', async (error, p) => {
    console.log('unhandledRejection');
    console.log(error, p);
    if (_.get(envs, ['args', 'debugMode'])) debugger;
    process.exit(1);
  });

  const { envsId, envs, log } = require('./env')();

  await envs.init(args);

  log({ level: 'env', dataType: 'global_env' });
  log({ level: 'env', dataType: 'settings_env' });

  if (_.isEmpty(testsList)) testsList = [envs.get('args.testFile')];

  for (let i = 0; i < testsList.length; i++) {
    const testFile = testsList[i];
    const fullJSON = getFullDepthJSON({
      envs: envs,
      filePath: testFile,
    });
    log({ level: 'env', testStruct: fullJSON, dataType: 'struct_test' });
    let test = getTest(fullJSON, envsId);
    await test();
  }

  await envs.closeBrowsers();
};

if (!module.parent) {
  main();
} else {
  module.exports = {
    main,
    getFullDepthJSON,
    getTest,
    env: require('./env'),
  };
}
