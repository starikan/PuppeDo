const _ = require('lodash');
const { stylesConsole } =  require('./helpers');

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
  const styleFunction = _.get(stylesConsole, 'error', args => args);
  console.log(styleFunction(error.message));
  console.log();
  console.log(styleFunction(error.stack));
  if (!module.parent) {
    process.exit(1);
  }
};

module.exports = {
  errorHandler,
};
