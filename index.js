const _ = require('lodash');

const {
  getFullDepthJSON
} = require('./getFullDepthJSON');
const {
  getTest
} = require('./getTest');
const {
  argParse
} = require('./helpers');

const main = async (args = {}) => {
  let envsIdGlob = null;
  args = argParse(args);

  for (let i = 0; i < args.testsList.length; i++) {
    console.log("TEST", args.testsList[i]);

    let {
      envsId,
      envs,
      log
    } = require('./env')(envsIdGlob);
    envsIdGlob = envsId;

    process.on('unhandledRejection', async (error, p) => {
      console.log('unhandledRejection');
      console.log(error, p);
      if (_.get(envs, ['args', 'debugMode'])) debugger;
      process.exit(1);
    });

    const testFile = args.testsList[i];
    const testName = testFile.split('/')[testFile.split('/').length - 1];
    args.testFile = testFile;
    args.testName = testName;

    await envs.init(args);
    await envs.initOutput({
      test: testName,
      output: args.outputFolder
    });
    await envs.initOutputLatest({
      output: args.outputFolder
    });


    log({
      level: 'env',
      dataType: 'global_env'
    });
    log({
      level: 'env',
      dataType: 'settings_env'
    });

    const fullJSON = getFullDepthJSON({
      envs: envs,
      filePath: testFile,
    });
    log({
      level: 'env',
      testStruct: fullJSON,
      dataType: 'struct_test'
    });

    let test = getTest(fullJSON, envsId);
    await test();
    await envs.closeBrowsers();
  }

  process.exit(1);
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