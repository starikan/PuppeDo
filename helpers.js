const deepmerge = require('deepmerge');

const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

const merge = (...objects) =>
  deepmerge.all(objects, { arrayMerge: (destinationArray, sourceArray, options) => sourceArray });

// https://stackoverflow.com/questions/23975735/what-is-this-u001b9-syntax-of-choosing-what-color-text-appears-on-console
const stylesConsole = {
  raw: _logString => _logString,
  debug: _logString => _logString,
  info: _logString => `\u001b[${35}m${_logString}\u001b[0m`, // pink
  test: _logString => `\u001b[${32}m${_logString}\u001b[0m`, // green
  warn: _logString => `\u001b[${33}m${_logString}\u001b[0m`, // yellow
  error: _logString => `\u001b[${31}m${_logString}\u001b[0m`, // red
  trace: _logString => `\u001b[${36}m${_logString}\u001b[0m`, // blue
  env: _logString => `\u001b[${34}m${_logString}\u001b[0m`, // violete
};

module.exports = {
  merge,
  sleep,
  stylesConsole,
};
