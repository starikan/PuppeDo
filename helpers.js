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
  constructor({ rootFolder = process.cwd(), additionalFolders = [], ignorePaths = null } = {}) {
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

class Arguments extends Singleton {
  constructor() {
    super();
  }

  // TODO добавить дополнительные папки с тестами чтобы сделать атомы пакетом нпм

  init(args) {
    this.strings = []

    this.argsJS = this.parseJS(args);
    this.argsCLI = this.parseCLI();
    this.argsEnv = this.parseENV();
    this.argsDefault = this.parseDefault();
    this.args = this.mergeArgs();
    return this.args;
  }

  removeEmpty(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([k, v]) => v != null));
  }

  resolveJson(str) {
    if (!str) {
      return null;
    }
    try {
      const parsedJson = JSON.parse(str);
      return parsedJson;
    } catch (error) {
      return String(str);
    }
  }

  parseDefault() {
    this.argsDefault = {
      rootFolder: process.cwd(),
      envs: [],
      tests: [],
      outputFolder: 'output',
      data: {},
      selectors: {},
      extFiles: [],
      debugMode: false,
      logDisabled: false,
    };

    return this.argsDefault;
  }

  parseJS(args) {
    this.argsJS = {
      rootFolder: _.get(args, 'PPD_ROOT'),
      envs: _.get(args, 'PPD_ENVS'),
      tests: _.get(args, 'PPD_TESTS'),
      outputFolder: _.get(args, 'PPD_OUTPUT'),
      data: _.get(args, 'PPD_DATA'),
      selectors: _.get(args, 'PPD_SELECTORS'),
      extFiles: this.resolveJson(_.get(args, 'PPD_EXT_FILES')),
      debugMode: _.get(args, 'PPD_DEBUG_MODE'),
      logDisabled: _.get(args, 'PPD_LOG_DISABLED'),
    };

    this.argsJS = this.removeEmpty(this.argsJS);
    return this.argsJS;
  }

  parseCLI() {
    const argsExt = {};

    _.forEach(process.argv.slice(2), v => {
      let data = v.split('=');
      argsExt[data[0]] = data[1];
    });

    this.argsCLI = {
      rootFolder: _.get(argsExt, 'PPD_ROOT'),
      envs: JSON.parse(_.get(argsExt, 'PPD_ENVS', 'null')),
      tests: this.resolveJson(_.get(argsExt, 'PPD_TESTS')),
      outputFolder: _.get(argsExt, 'PPD_OUTPUT'),
      data: _.get(argsExt, 'PPD_DATA'),
      selectors: _.get(argsExt, 'PPD_SELECTORS'),
      extFiles: this.resolveJson(_.get(argsExt, 'PPD_EXT_FILES')),
      debugMode: _.get(argsExt, 'PPD_DEBUG_MODE'),
      logDisabled: _.get(argsExt, 'PPD_LOG_DISABLED'),
    };

    this.argsCLI = this.removeEmpty(this.argsCLI);
    return this.argsCLI;
  }

  parseENV() {
    this.argsEnv = {
      rootFolder: process.env.PPD_ROOT,
      envs: JSON.parse(process.env.PPD_ENVS || 'null'),
      tests: this.resolveJson(process.env.PPD_TESTS),
      outputFolder: process.env.PPD_OUTPUT,
      data: this.resolveJson(process.env.PPD_DATA),
      selectors: this.resolveJson(process.env.PPD_SELECTORS),
      extFiles: this.resolveJson(process.env.PPD_EXT_FILES),
      debugMode: ['true', 'false'].includes(process.env.PPD_DEBUG_MODE) ? JSON.parse(process.env.PPD_DEBUG_MODE) : null,
      logDisabled: ['true', 'false'].includes(process.env.PPD_LOG_DISABLED)
        ? JSON.parse(process.env.PPD_LOG_DISABLED)
        : null,
    };

    this.argsEnv = this.removeEmpty(this.argsEnv);
    return this.argsEnv;
  }

  mergeArgs() {
    this.args = merge(this.argsDefault, this.argsEnv, this.argsCLI, this.argsJS);

    if (!this.args.tests || _.isEmpty(this.args.tests)) {
      throw { message: 'There is no tests to run. Pass any test in PPD_TESTS argument' };
    }

    if (!this.args.envs || _.isEmpty(this.args.envs)) {
      throw { message: 'There is no environments to run. Pass any test in PPD_ENVS argument' };
    }

    this.args.tests = !_.isArray(this.args.tests) ? [this.args.tests] : this.args.tests;
    this.args.envs = !_.isArray(this.args.envs) ? [this.args.envs] : this.args.envs;

    return this.args;
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
  sleep,
  stylesConsole,
  TestsContent,
  Arguments,
};
