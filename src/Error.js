const { paintString } = require('./Helpers.js');

const errorHandler = async (errorIncome) => {
  const error = { ...errorIncome };
  error.messageObj = (error.message || '').split(' || ');
  if (error.socket && error.socket.sendYAML) {
    error.socket.sendYAML({ data: { ...error }, type: error.type || 'error', envsId: error.envsId });
  }
  if (error.stack) {
    error.stack = error.stack.split('\n    ');
    // eslint-disable-next-line no-console
    console.log(paintString(error.stack, 'error'));
  }
  if (error.debug) {
    // eslint-disable-next-line no-debugger
    debugger;
  }
  // if (!module.parent) {
  process.exit(1);
  // }
};

module.exports = {
  errorHandler,
};
