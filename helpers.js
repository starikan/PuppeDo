const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const walkSync = require('walk-sync');
const yaml = require('js-yaml');
const deepmerge = require('deepmerge');

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
        if (allElements) {
          element = await page.$$(selector);
        } else {
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
    };

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

const resolveStars = function (linksArray, testsFolder = '.') {
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


const argParse = args => {
  let args_ext = {};
  _.forEach(process.argv.slice(2), v => {
    let data = v.split('=');
    args_ext[data[0]] = data[1];
  });

  let outputFolder = process.env.PPD_OUTPUT || _.get(args, 'output') || _.get(args_ext, '--output', 'output');
  let envFiles = process.env.PPD_ENVS ?
    JSON.parse(process.env.PPD_ENVS) :
    _.get(args, 'envs') || JSON.parse(_.get(args_ext, '--envs', '[]'));
  let testsFolder =
    process.env.PPD_TEST_FOLDER || _.get(args, 'testsFolder') || _.get(args_ext, '--testsFolder', process.cwd());
  let envsExt = process.env.PPD_ENVS_EXT ?
    JSON.parse(process.env.PPD_ENVS_EXT) :
    _.get(args, 'envsExt') || JSON.parse(_.get(args_ext, '--envsExt', '{}'));
  let envsExtJson = process.env.PPD_ENVS_EXT_JSON || _.get(args, 'envsExtJson') || _.get(args_ext, '--envsExt');
  let extData = process.env.PPD_DATA ?
    JSON.parse(process.env.PPD_DATA) :
    _.get(args, 'data') || JSON.parse(_.get(args_ext, '--data', '{}'));
  let extSelectors = process.env.PPD_SELECTORS ?
    JSON.parse(process.env.PPD_SELECTORS) :
    _.get(args, 'selectors') || JSON.parse(_.get(args_ext, '--selectors', '{}'));
  let debugMode = process.env.PPD_DEBUG_MODE || _.get(args, 'debugMode') || _.get(args_ext, '--debugMode', false);
  let logDisabled = process.env.PPD_LOG_DISABLED || _.get(args, 'logDisabled') || _.get(args_ext, '--logDisabled', false);

  let testsList = process.env.PPD_TESTS_LIST ?
    JSON.parse(process.env.PPD_TESTS_LIST) :
    _.get(args, 'testsList') || JSON.parse(_.get(args_ext, '--testsList', '[]'));

  let testFile = process.env.PPD_TEST || _.get(args, 'test') || _.get(args_ext, '--test');

  if (_.isEmpty(testsList)) {
    testsList = [testFile];
  };

  let extDataExt_files = process.env.PPD_DATA_EXT ?
    JSON.parse(process.env.PPD_DATA_EXT) :
    _.get(args, 'dataExt') || JSON.parse(_.get(args_ext, '--dataExt', '[]'));

  let extSelectorsExt_files = process.env.PPD_SELECTORS_EXT ?
    JSON.parse(process.env.PPD_SELECTORS_EXT) :
    _.get(args, 'selectorsExt') || JSON.parse(_.get(args_ext, '--selectorsExt', '[]'));

  extDataExt_files = resolveStars(extDataExt_files, testsFolder);
  let extDataExt = {};
  extDataExt_files.forEach(f => {
    const data_ext = yaml.safeLoad(fs.readFileSync(f, 'utf8'));
    extDataExt = deepmerge(extDataExt, data_ext, {
      arrayMerge: overwriteMerge,
    });
  });

  extSelectorsExt_files = resolveStars(extSelectorsExt_files, testsFolder);
  let extSelectorsExt = {};
  extSelectorsExt_files.forEach(f => {
    const selectors_ext = yaml.safeLoad(fs.readFileSync(f, 'utf8'));
    extSelectorsExt = deepmerge(extSelectorsExt, selectors_ext, {
      arrayMerge: overwriteMerge,
    });
  });

  if (!envFiles || _.isEmpty(envFiles)) {
    throw {
      message: `Не указано ни одной среды исполнения. Параметр 'envs' должен быть не пустой массив`,
    };
  }

  if (envsExtJson) {
    try {
      let envsExtJson_data = require(path.join(testsFolder, envsExtJson));
      envsExt = deepmerge.all([envsExtJson_data, envsExt], {
        arrayMerge: overwriteMerge,
      });
    } catch (err) {}
  }

  return {
    outputFolder,
    envFiles,
    testsFolder,
    envsExt,
    envsExtJson,
    extData,
    extSelectors,
    debugMode,
    testsList,
    testFile,
    extDataExt_files,
    extSelectorsExt_files,
    extDataExt,
    extSelectorsExt,
    logDisabled,
  };
}

module.exports = {
  Helpers,
  overwriteMerge,
  resolveStars,
  argParse,
};