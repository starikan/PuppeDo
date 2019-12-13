const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const walkSync = require('walk-sync');
const yaml = require('js-yaml');
const deepmerge = require('deepmerge');
require('polyfill-object.fromentries');

const { Singleton } = require('./singleton');
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

class TestsContent extends Singleton {
  constructor({rootFolder = process.cwd(), additionalFolders = [], ignorePaths = null} = {}) {
    super();
    this.allData = this.allData || null;
    this.rootFolder = this.rootFolder || rootFolder;
    this.additionalFolders = this.additionalFolders || additionalFolders;
    this.ignorePaths = this.ignorePaths || ignorePaths;
  }

  setRootFolder(rootFolder) {
    this.rootFolder = rootFolder;
  }

  setAdditionalFolders(additionalFolders = []) {
    this.additionalFolders = additionalFolders;
  }

  async getAllData(force = false) {
    if (force || !this.allData) {
      console.time('getAllData');

      const rootFolder = path.normalize(this.rootFolder);

      // TODO: additionalFolders, ignorePaths

      const allContent = [];
      const paths = walkSync(rootFolder);
      const exts = ['.yaml', '.yml', '.ppd'];

      // startsWith('.') remove folders like .git
      const allFiles = _.filter(paths, v => !v.startsWith('.') && exts.includes(path.parse(v).ext));

      allFiles.forEach(filePath => {
        try {
          const full = yaml.safeLoadAll(fs.readFileSync(path.join(rootFolder, filePath), 'utf8'));
          for (let v of full) {
            v.filePath = path.join(rootFolder, filePath);
            allContent.push(v);
          }
        } catch (e) {
          throw e;
        }
      });

      const atoms = allContent.filter(v => v.type === 'atom' && v);
      const tests = allContent.filter(v => v.type === 'test' && v);
      const envs = allContent.filter(v => v.type === 'env' && v);
      const data = allContent.filter(v => v.type === 'data' && v);
      const selectors = allContent.filter(v => v.type === 'selectors' && v);

      console.timeEnd('getAllData');

      this.allData = { allFiles, allContent, atoms, tests, envs, data, selectors };

      return this.allData;
    } else {
      return this.allData;
    }
  }
}

const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

const merge = (...objects) =>
  deepmerge.all(objects, { arrayMerge: (destinationArray, sourceArray, options) => sourceArray });

const resolveStars = function(linksArray, rootFolder = '.') {
  let resolvedArray = [];
  if (!_.isArray(linksArray)) return resolvedArray;
  linksArray.forEach(fileName => {
    if (fileName.endsWith('*')) {
      let fileMask = _.trimEnd(fileName, '*').replace(/\\/g, '\\\\');
      fileMask = _.trimEnd(fileMask, '/');
      fileMask = _.trimEnd(fileMask, '\\\\');
      const fullFileMask = path.join(rootFolder, fileMask);
      let paths = walkSync(fullFileMask);
      let pathsClean = _.map(paths, v => {
        if (v.endsWith('/') || v.endsWith('\\')) return false;
        return path.join(fullFileMask, v);
      }).filter(v => v);
      resolvedArray = [...resolvedArray, ...pathsClean];
    } else {
      resolvedArray.push(path.join(rootFolder, fileName));
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

  const removeEmpty = obj => Object.fromEntries(Object.entries(obj).filter(([k, v]) => v != null));

  // TODO добавить дополнительные папки с тестами чтобы сделать атомы пакетом нпм

  try {
    argsEnv = {
      rootFolder: process.env.PPD_ROOT,
      envFiles: JSON.parse(process.env.PPD_ENVS || 'null'),
      tests: resolveJson(process.env.PPD_TESTS),
      outputFolder: process.env.PPD_OUTPUT,
      data: resolveJson(process.env.PPD_DATA),
      selectors: resolveJson(process.env.PPD_SELECTORS),
      extFiles: resolveJson(process.env.PPD_EXT_FILES),
      debugMode: ['true', 'false'].includes(process.env.PPD_DEBUG_MODE) ? JSON.parse(process.env.PPD_DEBUG_MODE) : null,
      logDisabled: ['true', 'false'].includes(process.env.PPD_LOG_DISABLED)
        ? JSON.parse(process.env.PPD_LOG_DISABLED)
        : null,
    };

    argsRaw = {
      rootFolder: _.get(args, 'PPD_ROOT'),
      envFiles: _.get(args, 'PPD_ENVS'),
      tests: _.get(args, 'PPD_TESTS'),
      outputFolder: _.get(args, 'PPD_OUTPUT'),
      data: _.get(args, 'PPD_DATA'),
      selectors: _.get(args, 'PPD_SELECTORS'),
      extFiles: resolveJson(_.get(args, 'PPD_EXT_FILES')),
      debugMode: _.get(args, 'PPD_DEBUG_MODE'),
      logDisabled: _.get(args, 'PPD_LOG_DISABLED'),
    };

    argsExt = {
      rootFolder: _.get(args_ext, 'PPD_ROOT'),
      envFiles: JSON.parse(_.get(args_ext, 'PPD_ENVS', 'null')),
      tests: resolveJson(_.get(args_ext, 'PPD_TESTS')),
      outputFolder: _.get(args_ext, 'PPD_OUTPUT'),
      data: _.get(args_ext, 'PPD_DATA'),
      selectors: _.get(args_ext, 'PPD_SELECTORS'),
      extFiles: resolveJson(_.get(args_ext, 'PPD_EXT_FILES')),
      debugMode: _.get(args_ext, 'PPD_DEBUG_MODE'),
      logDisabled: _.get(args_ext, 'PPD_LOG_DISABLED'),
    };

    argsDefault = {
      rootFolder: process.cwd(),
      envFiles: [],
      tests: [],
      outputFolder: 'output',
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
    let { rootFolder, outputFolder, envFiles, extFiles, data, selectors, tests, debugMode, logDisabled } = megessss;

    tests = !_.isArray(tests) ? [tests] : tests;

    // ENVS LOADING
    if (!envFiles || _.isEmpty(envFiles)) {
      throw { message: `Не указано ни одной среды исполнения. Параметр 'envs' должен быть не пустой массив` };
    }
    let envs = resolveStars(envFiles, rootFolder);
    envs = envs.map(v => yaml.safeLoad(fs.readFileSync(v, 'utf8')));

    // EXTENSION FILES
    extFiles = resolveStars(extFiles, rootFolder);
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
      dataExt = resolveStars(_.isString(dataExt) ? [dataExt] : dataExt);
      envs[i].data = data;
      for (let j = 0; j < dataExt.length; j++) {
        dataExt[j] = await yaml.safeLoad(fs.readFileSync(path.join(rootFolder, dataExt[j]), 'utf8'));
        if (_.get(dataExt[j], 'type') === 'data') {
          envs[i].data = merge(envs[i].data, _.get(dataExt[j], 'data', {}));
        }
      }

      let selectorsExt = _.get(env, 'selectorsExt');
      selectorsExt = resolveStars(_.isString(selectorsExt) ? [selectorsExt] : selectorsExt);
      envs[i].selectors = selectors;
      for (let j = 0; j < selectorsExt.length; j++) {
        selectorsExt[j] = await yaml.safeLoad(fs.readFileSync(path.join(rootFolder, selectorsExt[j]), 'utf8'));
        if (_.get(selectorsExt[j], 'type') === 'selectors') {
          envs[i].selectors = merge(envs[i].selectors, _.get(selectorsExt[j], 'data', {}));
        }
      }
    }

    return {
      rootFolder,
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
  resolveStars,
  argParse,
  sleep,
  stylesConsole,
  TestsContent,
};
