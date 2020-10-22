require('source-map-support').install();

const {
  run,
  errorHandler,
  TestStructure,
  getTest,
  TestsContent,
  Environment,
  Arguments,
  Blocker,
  Log,
  Singleton,
  sleep,
  merge,
  paintString,
  blankSocket,
  argsDefault,
  runScriptInContext,
} = require('./dist/index').default;

process.on('unhandledRejection', errorHandler);
process.on('SyntaxError', errorHandler);

if (!module.parent) {
  run();
} else {
  module.exports = {
    run,
    errorHandler,
    TestStructure,
    getTest,
    TestsContent,
    Environment,
    Arguments,
    Blocker,
    Log,
    Singleton,
    sleep,
    merge,
    paintString,
    blankSocket,
    argsDefault,
    runScriptInContext,
  };
}
