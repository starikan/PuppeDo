const { main } = require('./Api');
const { errorHandler } = require('./Error');
const { getFullDepthJSON } = require('./getFullDepthJSON');
const { TestsContent } = require('./TestContent');
const { Arguments } = require('./Arguments');
const { Blocker } = require('./Blocker');

process.on('unhandledRejection', errorHandler);
process.on('SyntaxError', errorHandler);

if (!module.parent) {
  main();
} else {
  module.exports = {
    main,
    getFullDepthJSON,
    TestsContent,
    Arguments,
    Blocker,
  };
}
