const { paintString } = require('./helpers');

const errorHandler = async (error) => {
  error.messageObj = (error.message || '').split(' || ');
  if (error.socket && error.socket.sendYAML) {
    error.socket.sendYAML({ data: { ...error }, type: error.type || 'error', envsId: error.envsId });
  }
  if (error.stack) {
    error.stack = error.stack.split('\n    ');
    console.log(paintString(error.stack, 'error'));
  }
  if (error.debug) {
    debugger;
  }
  // if (!module.parent) {
  process.exit(1);
  // }
};

module.exports = {
  errorHandler,
};
