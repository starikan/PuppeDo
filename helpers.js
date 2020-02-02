const deepmerge = require('deepmerge');

const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

const merge = (...objects) =>
  deepmerge.all(objects, { arrayMerge: (destinationArray, sourceArray, options) => sourceArray });

// https://stackoverflow.com/questions/23975735/what-is-this-u001b9-syntax-of-choosing-what-color-text-appears-on-console

// SANE = "\u001B[0m"

// HIGH_INTENSITY = "\u001B[1m"
// LOW_INTENSITY = "\u001B[2m"

// ITALIC = "\u001B[3m"
// UNDERLINE = "\u001B[4m"
// BLINK = "\u001B[5m"
// RAPID_BLINK = "\u001B[6m"
// REVERSE_VIDEO = "\u001B[7m"
// INVISIBLE_TEXT = "\u001B[8m"

// BLACK = "\u001B[30m"
// RED = "\u001B[31m"
// GREEN = "\u001B[32m"
// YELLOW = "\u001B[33m"  1
// BLUE = "\u001B[34m"
// MAGENTA = "\u001B[35m"
// CYAN = "\u001B[36m"
// WHITE = "\u001B[37m"

// BACKGROUND_BLACK = "\u001B[40m"
// BACKGROUND_RED = "\u001B[41m"
// BACKGROUND_GREEN = "\u001B[42m"
// BACKGROUND_YELLOW = "\u001B[43m"
// BACKGROUND_BLUE = "\u001B[44m"
// BACKGROUND_MAGENTA = "\u001B[45m"
// BACKGROUND_CYAN = "\u001B[46m"
// BACKGROUND_WHITE = "\u001B[47m"

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
  info: str => paintString(str, 'blue'),
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
