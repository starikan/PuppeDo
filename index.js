const {
  run,
  socketServer,
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
} = require('./dist/index');

process.on('unhandledRejection', errorHandler);
process.on('SyntaxError', errorHandler);

if (!module.parent) {
  run();
} else {
  module.exports = {
    run,
    socketServer,
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
  };
}
