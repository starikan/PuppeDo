const path = require('path');

const _ = require('lodash');
const walkSync = require('walk-sync');

class Helpers {
  constructor(){}

  async getElement(page, selector){
    if (page && selector && _.isString(selector) && _.isObject(page)){
      let element;
      if (selector.startsWith('xpath:')){
        selector = _.trimStart(selector, 'xpath:');
        element = await page.$x(selector);
        if (element.length > 1) {
          throw({
            message: `Finded more then 1 xpath elements ${selector}`
          })
        }
        element = element[0];      }
      else {
        selector = _.trimStart(selector, 'css:');
        element = await page.$(selector);
      }
      return element;
    }
    else {
      return false;
    }
  }

  anyGet (object, paths) {
    if (!object || !_.isObject(object) || !paths || (!_.isString(paths) && !_.isArray(paths))){
      debugger
      throw({
        message: `anyGet error`
      })
    }

    let result;
    if (_.isString(paths)){
      result = _.get(object, paths);
    }

    if (_.isArray(paths)){
      paths.forEach(s => {
        if (_.get(object, s)){
          result = _.get(object, s);
        }
      })
    }

    return result;
  }

}

const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray

const resolveStars = function(linksArray, testsFolder = '.') {

  let resolvedArray = [];
  linksArray.forEach(fileName => {
    if (fileName.endsWith('*')){
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
    }
    else {
      resolvedArray.push(fileName)
    }
  });
  return resolvedArray;
}

module.exports = {
  Helpers,
  overwriteMerge,
  resolveStars,
}