const { log } = require('../logger/logger');

function bind(f) {
  return async function() {
    try {
      return await f.apply(this, arguments);
    } catch (error) {
      log({ text: `Atoms: ${f.name} - ${error.message}`, level: 'error' })
      throw error;
    }
  }
}

module.exports = {
  'typeInput': bind(require('./typeInput')),
  'buttonClick': bind(require('./buttonClick')),
};