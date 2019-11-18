const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const walkSync = require('walk-sync');
const yaml = require('js-yaml');
const deepmerge = require('deepmerge');
require('polyfill-object.fromentries');

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

const removeEmpty = obj => Object.fromEntries(Object.entries(obj).filter(([k, v]) => v != null));

const resolveStars = function(linksArray, testsFolder = '.') {
  let resolvedArray = [];
  if (!_.isArray(linksArray)) return resolvedArray;
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
  resolvedArray = resolvedArray.map(v => (v.endsWith('.yaml') ? v : v + '.yaml'));
  return resolvedArray;
};

const argParse = async args => {
  let args_ext = {};

  _.forEach(process.argv.slice(2), v => {
    let data = v.split('=');
    args_ext[data[0]] = data[1];
  });

  let argsEnv, argsRaw, argsExt, argsDefault;

  const resolveJson = str => {
    if (!str) {
      return null;
    }
    try {
      const parsedJson = JSON.parse(str);
      return parsedJson;
    } catch (error) {
      return String(str);
    }
  };

  try {
    argsEnv = {
      testsFolder: process.env.PPD_TEST_FOLDER,
      outputFolder: process.env.PPD_OUTPUT,
      envFiles: JSON.parse(process.env.PPD_ENVS || 'null'),

      tests: resolveJson(process.env.PPD_TESTS),
      data: resolveJson(process.env.PPD_DATA),
      selectors: resolveJson(process.env.PPD_SELECTORS),
      extFiles: resolveJson(process.env.PPD_EXT_FILES),

      debugMode: ['true', 'false'].includes(process.env.PPD_DEBUG_MODE) ? JSON.parse(process.env.PPD_DEBUG_MODE) : null,
      logDisabled: ['true', 'false'].includes(process.env.PPD_LOG_DISABLED)
        ? JSON.parse(process.env.PPD_LOG_DISABLED)
        : null,
    };

    argsRaw = {
      testsFolder: _.get(args, 'testsFolder'),
      outputFolder: _.get(args, 'output'),
      envFiles: _.get(args, 'envs'),

      tests: _.get(args, 'tests'),
      data: _.get(args, 'data'),
      selectors: _.get(args, 'selectors'),
      extFiles: resolveJson(_.get(args, 'extFiles')),

      debugMode: _.get(args, 'debugMode'),
      logDisabled: _.get(args, 'logDisabled'),
    };

    argsExt = {
      testsFolder: _.get(args_ext, '--testsFolder'),
      outputFolder: _.get(args_ext, '--output'),
      envFiles: JSON.parse(_.get(args_ext, '--envs', 'null')),

      tests: resolveJson(_.get(args_ext, '--tests')),
      data: _.get(args_ext, '--data'),
      selectors: _.get(args_ext, '--selectors'),
      extFiles: resolveJson(_.get(args_ext, '--extFiles')),

      debugMode: _.get(args_ext, '--debugMode'),
      logDisabled: _.get(args_ext, '--logDisabled'),
    };

    argsDefault = {
      testsFolder: process.cwd(),
      outputFolder: 'output',
      envFiles: [],

      tests: [],
      data: {},
      selectors: {},
      extFiles: [],

      debugMode: false,
      logDisabled: false,
    };

    argsDefault = removeEmpty(argsDefault);
    argsExt = removeEmpty(argsExt);
    argsRaw = removeEmpty(argsRaw);
    argsEnv = removeEmpty(argsEnv);

    const megessss = merge(argsDefault, argsExt, argsRaw, argsEnv);
    let { testsFolder, outputFolder, envFiles, extFiles, data, selectors, tests, debugMode, logDisabled } = megessss;

    tests = !_.isArray(tests) ? [tests] : tests;

    // ENVS LOADING
    if (!envFiles || _.isEmpty(envFiles)) {
      throw { message: `Не указано ни одной среды исполнения. Параметр 'envs' должен быть не пустой массив` };
    }
    let envs = resolveStars(envFiles, testsFolder);
    envs = envs.map(v => yaml.safeLoad(fs.readFileSync(v, 'utf8')));

    // EXTENSION FILES
    extFiles = resolveStars(extFiles, testsFolder);
    extFiles = extFiles.map(v => yaml.safeLoad(fs.readFileSync(v, 'utf8')));
    extFiles.forEach(v => {
      if (_.get(v, 'type') === 'data') {
        data = merge(data, _.get(v, 'data', {}));
      }
      if (_.get(v, 'type') === 'selectors') {
        selectors = merge(selectors, _.get(v, 'data', {}));
      }
      if (_.get(v, 'type') === 'env') {
        for (let i = 0; i < envs.length; i++) {
          const element = envs[i];
          if (_.get(element, 'name') === _.get(v, 'name')) {
            envs[i] = merge(element, v);
          }
        }
      }
    });

    // Data and Selectors resolve in env
    for (let i = 0; i < envs.length; i++) {
      const env = envs[i];
      let dataExt = _.get(env, 'dataExt');
      let selectorsExt = _.get(env, 'selectorsExt');
      dataExt = _.isString(dataExt) ? [dataExt] : dataExt;
      selectorsExt = _.isString(selectorsExt) ? [selectorsExt] : selectorsExt;
      dataExt = resolveStars(dataExt);
      selectorsExt = resolveStars(selectorsExt);
      for (let i = 0; i < dataExt.length; i++) {
        // debugger
        dataExt[i] = await yaml.safeLoad(fs.readFileSync(path.join(testsFolder, dataExt[i]), 'utf8'));
        if (_.get(dataExt[i], 'type') === 'data') {
          envs[i].data = merge(data, _.get(dataExt[i], 'data'));
        }
      }
      for (let i = 0; i < selectorsExt.length; i++) {
        selectorsExt[i] = await yaml.safeLoad(fs.readFileSync(path.join(testsFolder, selectorsExt[i]), 'utf8'));
        if (_.get(selectorsExt[i], 'type') === 'selectors') {
          envs[i].selectors = merge(selectors, _.get(selectorsExt[i], 'data'));
        }
      }
    }

    return {
      testsFolder,
      outputFolder,
      envs,
      tests,
      data,
      selectors,
      debugMode,
      logDisabled,
    };
  } catch (error) {
    debugger;
    // TODO: 2019-07-18 S.Starodubov todo
  }
};

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
  resolveStars,
  argParse,
  sleep,
  stylesConsole,
};
