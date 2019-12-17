const _ = require('lodash');
const deepmerge = require('deepmerge');

class Helpers {
  constructor() {}

  async getElement(page, selector, allElements = false) {
    if (page && selector && _.isString(selector) && _.isObject(page)) {
      let element;
      if (selector.startsWith('xpath:')) {
        selector = selector.replace(/^xpath:/, '');
        element = await page.$x(selector);
        if (!allElements) {
          if (element.length > 1) {
            throw { message: `Finded more then 1 xpath elements ${selector}` };
          }
          element = element[0];
        }
      } else {
        selector = selector.replace(/^css:/, '');
        element = allElements ? await page.$$(selector) : await page.$(selector);
      }
      return element;
    } else {
      return false;
    }
  }

  anyGet(object, paths) {
    let result;
    if (!object || !_.isObject(object) || !paths || (!_.isString(paths) && !_.isArray(paths))) {
      throw { message: `anyGet error` };
    }
    if (_.isString(paths)) {
      result = _.get(object, paths);
    } else {
      throw { message: `Ошибка при извлечении данных. Режиме вариативности переменных отключен` };
    }

    return result;
  }
}

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
  Helpers,
  merge,
  sleep,
  stylesConsole,
};
