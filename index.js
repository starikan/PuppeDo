const _ = require('lodash');

const { getFullDepthJSON, getDescriptions } = require('./getFullDepthJSON');
const { getTest } = require('./getTest');
const { argParse } = require('./helpers');
const { getAllYamls } = require('./yaml2json');

process.on('unhandledRejection', async error => {
  const errorObj = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    envsId: error.envsId,
    stepId: error.stepId,
  };
  //TODO: 2019-05-21 S.Starodubov пробрасывать эти параметры в ошибку
  if (error.socket && error.socket.sendYAML) {
    error.socket.sendYAML({ data: errorObj, type: 'error', envsId: error.envsId });
  }
  if (error.debug) {
    error.messageObj = _.get(error, 'message').split(' || ');
    console.log(error);
    debugger;
  }
  if (!module.parent) {
    process.exit(1);
  }
});

const main = async (args = {}, socket = null) => {
  try {
    if (!socket) {
      socket = {
        send: () => {},
        sendYAML: () => {},
      };
    }

    console.time();

    let envsIdGlob = null;
    let envsGlob = null;
    args = await argParse(args);
    socket.sendYAML({ data: args, type: 'init_args' });

    for (let i = 0; i < args.tests.length; i++) {
      let { envsId, envs, log } = require('./env')({ envsId: envsIdGlob, socket });
      envsIdGlob = envsId;
      envsGlob = envs;

      console.log(`======= TEST ${args.tests[i]} ========`);
      socket.sendYAML({ data: args.tests[i], type: 'test_run', envsId });

      const testFile = args.tests[i];
      const testName = testFile.split('/')[testFile.split('/').length - 1];
      args.testFile = testFile;
      args.testName = testName;

      await envs.init(args);
      await envs.initOutput({ test: testName, output: args.outputFolder });
      await envs.initOutputLatest({ output: args.outputFolder });

      const fullJSON = getFullDepthJSON({ envs: envs, filePath: testFile, textView: true });
      socket.sendYAML({ data: fullJSON, type: 'fullJSON', envsId });
      const fullDescriptions = getDescriptions();
      socket.sendYAML({ data: fullDescriptions, type: 'fullDescriptions', envsId });

      log({ level: 'env', text: '\n' + fullDescriptions, testStruct: fullJSON, screenshot: false });

      let test = getTest(fullJSON, envsId, socket);
      await test();
      socket.sendYAML({ data: args.tests[i], type: 'test_end', envsId });
    }

    await envsGlob.closeBrowsers();
    console.timeEnd();

    if (!module.parent) {
      process.exit(1);
    }
  } catch (error) {
    error.message += ` || error in 'main'`;
    error.socket = socket;
    throw error;
  }
};

const fetchStruct = async (args = {}, socket) => {
  try {
    args = await argParse(args);
    socket.sendYAML({ data: args, type: 'init_args' });
    let { envsId, envs } = require('./env')({ socket });
    await envs.init(args);

    const fullJSON = getFullDepthJSON({ envs: envs, filePath: args.testFile, textView: true });
    socket.sendYAML({ data: fullJSON, type: 'fullJSON', envsId });
    const fullDescriptions = getDescriptions();
    socket.sendYAML({ data: fullDescriptions, type: 'fullDescriptions', envsId });
  } catch (err) {
    err.message += ` || error in 'fetchStruct'`;
    err.socket = socket;
    throw err;
  }
};

const fetchAvailableTests = async (args = {}, socket) => {
  try {
    args = await argParse(args);
    socket.sendYAML({ data: args, type: 'init_args' });
    let { envsId, envs } = require('./env')({ socket });
    await envs.init(args);
    const testsFolder = _.get(envs, ['args', 'testsFolder'], '.');
    const allYamls = await getAllYamls({ testsFolder, envsId });
    socket.sendYAML({ data: allYamls, type: 'allYamls', envsId });
  } catch (err) {
    err.message += ` || error in 'fetchAvailableTests'`;
    err.socket = socket;
    throw err;
  }
};

if (!module.parent) {
  main();
} else {
  module.exports = {
    main,
    fetchStruct,
    fetchAvailableTests,
  };
}
