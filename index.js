require('source-map-support').install();

const { run } = require('./dist/Api');
const { errorHandler } = require('./dist/Error');
const { getFullDepthJSON } = require('./dist/getFullDepthJSON');
const { getTest } = require('./dist/getTest');
const TestsContent = require('./dist/TestContent');
const { Arguments } = require('./dist/Arguments');
const { Blocker } = require('./dist/Blocker');
const Environment = require('./dist/Environment');
const { Log } = require('./dist/Log');

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
