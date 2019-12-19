const _ = require('lodash');

const { getFullDepthJSON, getDescriptions } = require('./getFullDepthJSON');
const { getTest } = require('./getTest');
const { argParse } = require('./helpers');
const { socketMethods, createSocketServer } = require('./socketMethods');

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
    console.log(error);
    debugger;
  }
  if (!module.parent) {
    process.exit(1);
  }
});

const runLocal = async (args = {}, socket = null) => {
  if (!socket) {
    socket = {
      send: () => {},
      sendYAML: () => {},
    };
  }

  console.time();

  let envsIdGlob = null;
  args = argParse(args);
  socket.sendYAML({ data: args, type: 'init_args' });

  for (let i = 0; i < args.testsList.length; i++) {
    let { envsId, envs, log } = require('./env')({ envsId: envsIdGlob, socket });
    envsIdGlob = envsId;

    console.log('TEST', args.testsList[i]);
    socket.sendYAML({ data: args.testsList[i], type: 'test_run', envsId });

    const testFile = args.testsList[i];
    const testName = testFile.split('/')[testFile.split('/').length - 1];
    args.testFile = testFile;
    args.testName = testName;

    await envs.init({ args, envsId });
    await envs.initOutput({ test: testName, output: args.outputFolder });
    await envs.initOutputLatest({ output: args.outputFolder });

    const fullJSON = getFullDepthJSON({ envs: envs, filePath: testFile, textView: true });
    socket.sendYAML({ data: fullJSON, type: 'fullJSON', envsId });
    const fullDescriptions = getDescriptions();
    socket.sendYAML({ data: fullDescriptions, type: 'fullDescriptions', envsId });

    log({ level: 'env', text: fullDescriptions, testStruct: fullJSON, screenshot: false });

    let test = getTest(fullJSON, envsId, socket);
    await test();
    await envs.closeBrowsers();
    socket.sendYAML({ data: args.testsList[i], type: 'test_end', envsId });
  }

  console.timeEnd();

  if (!module.parent) {
    process.exit(1);
  }
};

const runPPDSocketServer = async () => {
  createSocketServer()
};

const main = async (args = {}, socket = null) => {
  try {
    await runLocal(args, socket);
  } catch (err) {
    err.message += ` || error in 'main'`;
    err.socket = socket;
    throw err;
  }
};

if (!module.parent) {
  main();
} else {
  module.exports = {
    main,
    socketMethods,
    runPPDSocketServer,
  };
}
