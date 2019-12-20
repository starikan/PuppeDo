require('@puppedo/atoms');
const { main, fetchStruct, fetchAvailableTests } = require('./Api');
const { errorHandler } = require('./Error');
const { getFullDepthJSON } = require('./getFullDepthJSON');

if (!module.parent) {
  process.on('unhandledRejection', errorHandler);
  process.on('SyntaxError', errorHandler);
  main();
} else {
  module.exports = {
    main,
    fetchStruct,
    fetchAvailableTests,
    getFullDepthJSON,
  };
}
