const { main } = require('./Api');
const { errorHandler } = require('./Error');
const { getFullDepthJSON } = require('./getFullDepthJSON');
const { getTest } = require('./getTest');
const { TestsContent } = require('./TestContent');
const { Arguments } = require('./Arguments');
const { Blocker } = require('./Blocker');
const Environment = require('./env');
const Log = require('./Log');

process.on('unhandledRejection', errorHandler);
process.on('SyntaxError', errorHandler);

if (!module.parent) {
  main();
} else {
  module.exports = {
    main,
    getFullDepthJSON,
    getTest,
    TestsContent,
    Environment,
    Arguments,
    Blocker,
    Log,
  };
}
