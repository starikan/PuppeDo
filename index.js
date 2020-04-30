const {
  run,
  errorHandler,
  getFullDepthJSON,
  getTest,
  TestsContent,
  Environment,
  Arguments,
  Blocker,
  Log,
} = require('./dist/index');

process.on('unhandledRejection', errorHandler);
process.on('SyntaxError', errorHandler);

if (!module.parent) {
  run();
} else {
  module.exports = { run, getFullDepthJSON, getTest, TestsContent, Environment, Arguments, Blocker, Log };
}
