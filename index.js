const _ = require('lodash');

const { getFullDepthJSON, getDescriptions } = require('./getFullDepthJSON');
const { getTest } = require('./getTest');
const { argParse } = require('./helpers');

const main = async (args = {}) => {
  console.time('Start');

  let envsIdGlob = null;
  args = argParse(args);

  for (let i = 0; i < args.testsList.length; i++) {
    console.log('TEST', args.testsList[i]);

    let { envsId, envs, log } = require('./env')(envsIdGlob);
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
    await envs.initOutput({ test: testName, output: args.outputFolder });
    await envs.initOutputLatest({ output: args.outputFolder });

    const fullJSON = getFullDepthJSON({ envs: envs, filePath: testFile, textView: true });
    const fullDescriptions = getDescriptions();

    log({ level: 'env', text: fullDescriptions, testStruct: fullJSON, screenshot: false });

    let test = getTest(fullJSON, envsId);
    await test();
    await envs.closeBrowsers();
  }

  console.timeEnd('Start');

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
