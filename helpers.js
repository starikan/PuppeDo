const path = require('path');

const _ = require('lodash');
const walkSync = require('walk-sync');

class Helpers {
  constructor() {}

  async getElement(page, selector, allElements = false) {
    if (page && selector && _.isString(selector) && _.isObject(page)) {
      let element;
      if (selector.startsWith('xpath:')) {
        selector = _.trimStart(selector, 'xpath:');
        element = await page.$x(selector);
        if (!allElements) {
          if (element.length > 1) {
            throw {
              message: `Finded more then 1 xpath elements ${selector}`,
            };
          }
          element = element[0];
        }
      } else {
        selector = _.trimStart(selector, 'css:');
        if (allElements){
          element = await page.$$(selector);
        }
        else {
          element = await page.$(selector);
        }
      }
      return element;
    } else {
      return false;
    }
  }

  anyGet(object, paths) {
    if (!object || !_.isObject(object) || !paths || (!_.isString(paths) && !_.isArray(paths))) {
      debugger;
      throw {
        message: `anyGet error`,
      };
    }

    let result;
    if (_.isString(paths)) {
      result = _.get(object, paths);
    } else {
      throw {
        message: `Ошибка при извлечении данных. Режиме вариативности переменных отключен`,
      };
    }

    // let results = {};
    // if (_.isArray(paths)){
    //   paths.forEach(s => {
    //     if (_.get(object, s)){
    //       result = _.get(object, s);
    //       results[s] = result;
    //     }
    //   })
    // }

    // if (Object.keys(results).length > 1) {
    //   throw({ message: `Ошибка при извлечении данных. В режиме вариативности переменной пришло несколько значений. Т.е. данные или селектор могут передаваться в нескольких видах например ['selector', 'sel', 's'] и данные переменные уже перезаписаны ранее, для избежания этой ошибки рекомендуется заменить например sel на select т.к. эта переменная будет запрошена раньше. Либо использовать единый стиль написания во всех тестах. Данные ${JSON.stringify(results)}` })
    // }

    return result;
  }
}

const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;

const resolveStars = function(linksArray, testsFolder = '.') {
  let resolvedArray = [];
  linksArray.forEach(fileName => {
    if (fileName.endsWith('*')) {
      let fileMask = _.trimEnd(fileName, '*').replace(/\\/g, '\\\\');
      fileMask = _.trimEnd(fileMask, '/');
      fileMask = _.trimEnd(fileMask, '\\\\');
      fullFileMask = path.join(testsFolder, fileMask);
      let paths = walkSync(fullFileMask);
      let pathsClean = _.map(paths, v => {
        if (v.endsWith('/') || v.endsWith('\\')) return false;
        return path.join(fullFileMask, v);
      }).filter(v => v);
      resolvedArray = [...resolvedArray, ...pathsClean];
    } else {
      resolvedArray.push(path.join(testsFolder, fileName));
    }
  });
  return resolvedArray;
};

let args_ext = {};
_.forEach(process.argv.slice(2), v => {
  let data = v.split('=');
  args_ext[data[0]] = data[1];
});

module.exports = {
  Helpers,
  overwriteMerge,
  resolveStars,
  args_ext,
};
