const { run } = require('./src/Api.js');
const { errorHandler } = require('./src/Error.js');
const { getFullDepthJSON } = require('./src/getFullDepthJSON.js');
const { getTest } = require('./src/getTest.js');
const TestsContent = require('./src/TestContent.js');
const { Arguments } = require('./src/Arguments.js');
const { Blocker } = require('./src/Blocker.js');
const Environment = require('./src/Environment.js');
const { Log } = require('./src/Log.js');

process.on('unhandledRejection', errorHandler);
process.on('SyntaxError', errorHandler);

if (!module.parent) {
  run();
} else {
  module.exports = {
    run,
    getFullDepthJSON,
    getTest,
    TestsContent,
    Environment,
    Arguments,
    Blocker,
    Log,
  };
}
