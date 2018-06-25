const { log } = require('../logger/logger');

function bind(f) {
  return async function() {
    try {
      return await f.apply(this, arguments);
    } catch (error) {
      log({ text: `Helper: ${f.name} - ${error.message}`, level: 'error' })
      throw error;
    }
  }
}

module.exports = {
  'initTest': bind(require('./initTest')),
  'start': bind(require('./start')),
  'end': bind(require('./end')),
  'wait': bind(require('./wait')),
};