const _ = require('lodash');
require('@puppedo/atoms');

const { getFullDepthJSON } = require('./getFullDepthJSON');
const { getTest } = require('./getTest');
const { stylesConsole } = require('./helpers');
const { TestsContent } = require('./TestContent');
const { Arguments } = require('./Arguments');

const errorHandler = async error => {
  error.messageObj = _.get(error, 'message').split(' || ');
  if (error.socket && error.socket.sendYAML) {
    error.socket.sendYAML({ data: { ...error }, type: error.type || 'error', envsId: error.envsId });
  }
  if (error.stack) {
    error.stack = error.stack.split('\n    ');
  }
  if (error.debug) {
    debugger;
  }
  const styleFunction = _.get(stylesConsole, 'trace', args => args);
  console.log(styleFunction(error.message));
  if (!module.parent) {
    process.exit(1);
  }
};

process.on('unhandledRejection', errorHandler);
process.on('SyntaxError', errorHandler);

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
    args = new Arguments().init(args);
    await new TestsContent({
      rootFolder: args.PPD_ROOT,
      additionalFolders: args.PPD_ROOT_ADDITIONAL,
      ignorePaths: args.PPD_ROOT_IGNORE,
    }).getAllData();

    socket.sendYAML({ data: args, type: 'init_args' });

    for (let i = 0; i < args.PPD_TESTS.length; i++) {
      let { envsId, envs, log } = require('./env')({ envsId: envsIdGlob, socket });
      envsIdGlob = envsId;
      envsGlob = envs;

      console.log(`======= TEST ${args.PPD_TESTS[i]} ========`);
      socket.sendYAML({ data: args.PPD_TESTS[i], type: 'test_run', envsId });

      args.testFile = args.PPD_TESTS[i];
      args.testName = args.testFile.split('/')[args.testFile.split('/').length - 1];

      await envs.initOutput(args);
      await envs.initOutputLatest(args);
      await envs.init();

      const { fullJSON, textDescription } = getFullDepthJSON({
        testName: envs.get('args.testFile'),
      });
      socket.sendYAML({ data: fullJSON, type: 'fullJSON', envsId });
      socket.sendYAML({ data: textDescription, type: 'fullDescriptions', envsId });

      log({ level: 'env', text: '\n' + textDescription, testStruct: fullJSON, screenshot: false });

      let test = getTest(fullJSON, envsId, socket);
      await test();
      socket.sendYAML({ data: args.PPD_TESTS[i], type: 'test_end', envsId });
    }

    await envsGlob.closeBrowsers();
    await envsGlob.closeProcesses();
    console.timeEnd();

    if (!module.parent) {
      process.exit(1);
    }
  } catch (error) {
    error.message += ` || error in 'main'`;
    error.socket = socket;
    if (String(error).startsWith('SyntaxError')) {
      error.debug = true;
      error.type = 'SyntaxError';
      await errorHandler(error);
      return;
    }
    await errorHandler(error);
  }
};

const fetchStruct = async (args = {}, socket) => {
  try {
    args = new Arguments().init(args);
    socket.sendYAML({ data: args, type: 'init_args' });
    let { envsId, envs } = require('./env')({ socket });
    await envs.init();

    await new TestsContent({
      rootFolder: args.PPD_ROOT,
      additionalFolders: args.PPD_ROOT_ADDITIONAL,
      ignorePaths: args.PPD_ROOT_IGNORE,
    }).getAllData();
    const { fullJSON, textDescription } = getFullDepthJSON({
      testName: args.testFile,
    });
    socket.sendYAML({ data: fullJSON, type: 'fullJSON', envsId });
    socket.sendYAML({ data: textDescription, type: 'fullDescriptions', envsId });
  } catch (err) {
    err.message += ` || error in 'fetchStruct'`;
    err.socket = socket;
    throw err;
  }
};

const fetchAvailableTests = async (args = {}, socket) => {
  try {
    args = new Arguments().init(args);
    socket.sendYAML({ data: args, type: 'init_args' });
    let { envsId, envs } = require('./env')({ socket });
    await envs.init();
    const allYamls = await new TestsContent({
      rootFolder: args.PPD_ROOT,
      additionalFolders: args.PPD_ROOT_ADDITIONAL,
      ignorePaths: args.PPD_ROOT_IGNORE,
    }).getAllData();
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
