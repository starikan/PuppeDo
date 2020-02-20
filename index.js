const { run } = require('./src/Api');
const { errorHandler } = require('./src/Error');
const { getFullDepthJSON } = require('./src/getFullDepthJSON');
const { getTest } = require('./src/getTest');
const TestsContent = require('./src/TestContent');
const { Arguments } = require('./src/Arguments');
const { Blocker } = require('./src/Blocker');
const Environment = require('./src/Environment.js');
const { Log } = require('./src/Log');

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
