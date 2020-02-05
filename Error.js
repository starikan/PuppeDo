const _ = require('lodash');
const { paintString } = require('./helpers');

const errorHandler = async error => {
  error.messageObj = _.get(error, 'message').split(' || ');
  if (error.socket && error.socket.sendYAML) {
    error.socket.sendYAML({ data: { ...error }, type: error.type || 'error', envsId: error.envsId });
  }
  if (error.stack) {
    error.stack = error.stack.split('\n    ');
  }
  if (error.debug) {
    debugger;
  }
  console.log(paintString(error.message, 'error'));
  console.log();
  error.stack ? console.log(paintString(error.stack, 'error')) : '';
  // if (!module.parent) {
  process.exit(1);
  // }
};

module.exports = {
  errorHandler,
};
