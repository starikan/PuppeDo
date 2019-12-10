const _ = require('lodash');

const { getFullDepthJSON, getDescriptions } = require('./getFullDepthJSON');
const { getTest } = require('./getTest');
const { argParse, stylesConsole } = require('./helpers');
const { getAllYamls } = require('./yaml2json');

const errorHandler = async error => {
  error.messageObj = _.get(error, 'message').split(' || ');
  if (error.socket && error.socket.sendYAML) {
    error.socket.sendYAML({ data: {...error}, type: error.type || 'error', envsId: error.envsId });
  }
  if (error.stack) {
    error.stack = error.stack.split('\n    ')
  }
  if (error.debug) {
    const styleFunction = _.get(stylesConsole, 'trace', args => args);
    console.log(styleFunction(error));
    debugger;
  }
  if (!module.parent) {
    process.exit(1);
  }
}

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
    args = await argParse(args);
    socket.sendYAML({ data: args, type: 'init_args' });

    for (let i = 0; i < args.tests.length; i++) {
      let { envsId, envs, log } = require('./env')({ envsId: envsIdGlob, socket });
      envsIdGlob = envsId;
      envsGlob = envs;

      console.log(`======= TEST ${args.tests[i]} ========`);
      socket.sendYAML({ data: args.tests[i], type: 'test_run', envsId });

      args.testFile = args.tests[i];
      args.testName = args.testFile.split('/')[args.testFile.split('/').length - 1];

      await envs.initOutput(args);
      await envs.initOutputLatest(args);
      await envs.init(args);

      const fullJSON = getFullDepthJSON({ envs: envs, filePath: args.testFile, textView: true });
      socket.sendYAML({ data: fullJSON, type: 'fullJSON', envsId });
      const fullDescriptions = getDescriptions();
      socket.sendYAML({ data: fullDescriptions, type: 'fullDescriptions', envsId });

      log({ level: 'env', text: '\n' + fullDescriptions, testStruct: fullJSON, screenshot: false });

      let test = getTest(fullJSON, envsId, socket);
      await test();
      socket.sendYAML({ data: args.tests[i], type: 'test_end', envsId });
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
    const styleFunction = _.get(stylesConsole, 'trace', args => args);
    console.log(styleFunction(error));
    if (String(error).startsWith('SyntaxError')) {
      error.debug = true;
      error.type = 'SyntaxError';
      await errorHandler(error);
      return;
    }
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
    const allYamls = await getAllYamls({ testsFolder });
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
