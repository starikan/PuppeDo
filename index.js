const { main, fetchStruct, fetchAvailableTests } = require('./Api');
const { errorHandler } = require('./Error');
const { getFullDepthJSON } = require('./getFullDepthJSON');
const { TestsContent } = require('./TestContent');
const { Arguments } = require('./Arguments');
const { Blocker } = require('./Blocker');

process.on('unhandledRejection', errorHandler);
process.on('SyntaxError', errorHandler);

try {
  require('@puppedo/atoms');
} catch (error) {}

if (!module.parent) {
  main();
} else {
  module.exports = {
    main,
    fetchStruct,
    fetchAvailableTests,
    getFullDepthJSON,
    TestsContent,
    Arguments,
    Blocker,
  };
}
