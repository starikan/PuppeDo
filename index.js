require('source-map-support').install();

const {
  run,
  errorHandler,
  FlowStructure,
  getTest,
  AgentContent,
  Environment,
  Arguments,
  Blocker,
  Log,
  Singleton,
  paintString,
  blankSocket,
  argsDefault,
  runScriptInContext,
  Screenshot,
  Plugin,
  Plugins,
} = require('./dist/index').default;

process.on('unhandledRejection', errorHandler);
process.on('SyntaxError', errorHandler);

if (!module.parent) {
  run();
} else {
  module.exports = {
    run,
    errorHandler,
    FlowStructure,
    getTest,
    AgentContent,
    Environment,
    Arguments,
    Blocker,
    Log,
    Singleton,
    paintString,
    blankSocket,
    argsDefault,
    runScriptInContext,
    Screenshot,
    Plugin,
    Plugins,
  };
}
