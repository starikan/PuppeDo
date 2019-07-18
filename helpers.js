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
            throw { message: `Finded more then 1 xpath elements ${selector}` };
          }
          element = element[0];
        }
      } else {
        selector = _.trimStart(selector, 'css:');
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

const resolveStars = function(linksArray, testsFolder = '.') {
  let resolvedArray = [];
  linksArray.forEach(fileName => {
    if (fileName.endsWith('*')) {
      let fileMask = _.trimEnd(fileName, '*').replace(/\\/g, '\\\\');
      fileMask = _.trimEnd(fileMask, '/');
      fileMask = _.trimEnd(fileMask, '\\\\');
      const fullFileMask = path.join(testsFolder, fileMask);
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

  let argsEnv = {
    testsFolder: process.env.PPD_TEST_FOLDER,
    testFile: process.env.PPD_TEST,
    testsList: JSON.parse(process.env.PPD_TESTS_LIST || 'null'),
    outputFolder: process.env.PPD_OUTPUT,
    envFiles: JSON.parse(process.env.PPD_ENVS || 'null'),

    envsExt: JSON.parse(process.env.PPD_ENVS_EXT || 'null'),
    envsExtJson: process.env.PPD_ENVS_EXT_JSON,
    extData: JSON.parse(process.env.PPD_DATA || 'null'),
    extSelectors: JSON.parse(process.env.PPD_SELECTORS || 'null'),
    extDataExt_files: JSON.parse(process.env.PPD_DATA_EXT || 'null'),
    extSelectorsExt_files: JSON.parse(process.env.PPD_SELECTORS_EXT || 'null'),

    debugMode: ['true', 'false'].includes(process.env.PPD_DEBUG_MODE) ? JSON.parse(process.env.PPD_DEBUG_MODE) : null,
    logDisabled: ['true', 'false'].includes(process.env.PPD_LOG_DISABLED)
      ? JSON.parse(process.env.PPD_LOG_DISABLED)
      : null,
  };

  let argsRaw = {
    testsFolder: _.get(args, 'testsFolder'),
    testsList: _.get(args, 'testsList'),
    testFile: _.get(args, 'testFile'),
    outputFolder: _.get(args, 'output'),
    envFiles: _.get(args, 'envs'),

    envsExt: _.get(args, 'envsExt'),
    envsExtJson: _.get(args, 'envsExtJson'),
    extData: _.get(args, 'extData'),
    extSelectors: _.get(args, 'extSelectors'),
    extDataExt_files: _.get(args, 'extDataExt_files'),
    extSelectorsExt_files: _.get(args, 'extSelectorsExt_files'),

    debugMode: _.get(args, 'debugMode'),
    logDisabled: _.get(args, 'logDisabled'),
  };

  let argsExt = {
    testsFolder: _.get(args_ext, '--testsFolder'),
    testFile: _.get(args_ext, '--test'),
    testsList: JSON.parse(_.get(args_ext, '--testsList', 'null')),
    outputFolder: _.get(args_ext, '--output'),
    envFiles: JSON.parse(_.get(args_ext, '--envs', 'null')),

    envsExt: JSON.parse(_.get(args_ext, '--envsExt', 'null')),
    envsExtJson: _.get(args_ext, '--envsExt'),
    extData: _.get(args_ext, '--data'),
    extSelectors: _.get(args_ext, '--selectors'),
    extDataExt_files: JSON.parse(_.get(args_ext, '--dataExt', 'null')),
    extSelectorsExt_files: JSON.parse(_.get(args_ext, '--selectorsExt', 'null')),

    debugMode: _.get(args_ext, '--debugMode'),
    logDisabled: _.get(args_ext, '--logDisabled'),
  };

  let argsDefault = {
    testsFolder: process.cwd(),
    testFile: null,
    testsList: [],
    outputFolder: 'output',
    envFiles: [],

    envsExt: {},
    envsExtJson: null,
    extData: {},
    extSelectors: {},
    extDataExt_files: [],
    extSelectorsExt_files: [],

    debugMode: false,
    logDisabled: false,
  };

  const removeEmpty = obj => Object.fromEntries(Object.entries(obj).filter(([k, v]) => v != null));

  argsDefault = removeEmpty(argsDefault);
  argsExt = removeEmpty(argsExt);
  argsRaw = removeEmpty(argsRaw);
  argsEnv = removeEmpty(argsEnv);

  const megessss = merge(argsDefault, argsExt, argsRaw, argsEnv);
  let {
    outputFolder,
    envFiles,
    testsFolder,
    envsExt,
    testsList,
    testFile,
    debugMode,
    logDisabled,
    extData,
    extSelectors,
    envsExtJson,
    extDataExt_files,
    extSelectorsExt_files,
  } = megessss;

  if (!envFiles || _.isEmpty(envFiles)) {
    throw { message: `Не указано ни одной среды исполнения. Параметр 'envs' должен быть не пустой массив` };
  }

  if (_.isEmpty(testsList)) {
    testsList = [testFile];
  }

  if (envsExtJson) {
    try {
      let envsExtJson_data = require(path.join(testsFolder, envsExtJson));
      envsExt = merge(envsExtJson_data, envsExt);
    } catch (err) {}
  }

  extDataExt_files = resolveStars(extDataExt_files, testsFolder);
  let extDataExt = {};
  extDataExt_files.forEach(f => {
    const data_ext = yaml.safeLoad(fs.readFileSync(f, 'utf8'));
    if (_.get(data_ext, 'type') === 'data') {
      extDataExt = merge(extDataExt, _.get(data_ext, 'data', {}));
    } else {
      throw { message: `Ext Data file ${f} not typed. Include "type: data" atribute` };
    }
  });

  extSelectorsExt_files = resolveStars(extSelectorsExt_files, testsFolder);
  let extSelectorsExt = {};
  extSelectorsExt_files.forEach(f => {
    const selectors_ext = yaml.safeLoad(fs.readFileSync(f, 'utf8'));
    if (_.get(selectors_ext, 'type') === 'selectors') {
      extSelectorsExt = merge(extSelectorsExt, _.get(selectors_ext, 'data', {}));
    } else {
      throw { message: `Ext Data file ${f} not typed. Include "type: selectors" atribute` };
    }
  });

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
};

module.exports = {
  Helpers,
  merge,
  resolveStars,
  argParse,
  sleep,
};
