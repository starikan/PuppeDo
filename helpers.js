const deepmerge = require('deepmerge');

const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

const merge = (...objects) =>
  deepmerge.all(objects, { arrayMerge: (destinationArray, sourceArray, options) => sourceArray });

// https://stackoverflow.com/questions/23975735/what-is-this-u001b9-syntax-of-choosing-what-color-text-appears-on-console

const paintString = (str, color = 'noColor') => {
  const colors = {
    noColor: 0,
    pink: 35,
    green: 32,
    yellow: 33,
    red: 31,
    blue: 36,
    violet: 34,
  };
  return `\u001b[${colors[color] || 0}m${str}\u001b[0m`;
};
const stylesConsole = {
  raw: str => paintString(str, 'noColor'),
  debug: str => paintString(str, 'noColor'),
  info: str => paintString(str, 'pink'),
  test: str => paintString(str, 'green'),
  warn: str => paintString(str, 'yellow'),
  error: str => paintString(str, 'red'),
  trace: str => paintString(str, 'blue'),
  env: str => paintString(str, 'violet'),
};

const blankSocket = {
  send: () => {},
  sendYAML: () => {},
};

module.exports = {
  merge,
  sleep,
  stylesConsole,
  blankSocket,
};
