const { log } = require('../logger/logger');

function bind(f) {
  return async function() {
    try {
      return await f.apply(this, arguments);
    } catch (error) {
      log({ text: `Test: ${f.name} - ${error.message}`, level: 'error' })
      throw error;
    }
  }
}

module.exports = {
  'login': bind(require('./login')),
}