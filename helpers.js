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
    this.argsDefault = {
      PPD_ROOT: process.cwd(),
      PPD_ENVS: [],
      PPD_TESTS: [],
      PPD_OUTPUT: 'output',
      PPD_DATA: {},
      PPD_SELECTORS: {},
      PPD_EXT_FILES: [],
      PPD_DEBUG_MODE: false,
      PPD_LOG_DISABLED: false,
    };
    this.params = Object.keys(this.argsDefault);
    this.argsJS = this.parser(args, this.params);
    this.argsEnv = this.parser(_.pick(process.env, this.params), this.params);
    this.argsCLI = this.parseCLI(this.params);
    this.args = this.mergeArgs();
    return this.args;
  }

  parser(args, params) {
    return params.reduce((s, val) => {
      let newVal = _.get(args, val);
      // If comma in string try convert to array
      if (_.isString(newVal)) {
        newVal = newVal.split(',');
        if (newVal.length === 1) {
          newVal = newVal[0];
        }
      }
      // Convert string to Boolean
      if (['true', 'false'].includes(newVal)) {
        newVal = newVal === 'true' ? true : false;
      }
      if (newVal) {
        s[val] = newVal;
      }
      return s;
    }, {});
  }

  parseCLI(params) {
    const argsRaw = process.argv
      .map(v => v.split(/\s+/))
      .flat()
      .map(v => v.split('='))
      .filter(v => v.length > 1)
      .filter(v => params.includes(v[0]));
    return this.parser(Object.fromEntries(argsRaw), params);
  }

  mergeArgs() {
    this.args = merge(this.argsDefault, this.argsEnv, this.argsCLI, this.argsJS);

    if (!this.args.PPD_TESTS || _.isEmpty(this.args.PPD_TESTS)) {
      throw { message: 'There is no tests to run. Pass any test in PPD_TESTS argument' };
    }

    if (!this.args.PPD_ENVS || _.isEmpty(this.args.PPD_ENVS)) {
      throw { message: 'There is no environments to run. Pass any test in PPD_ENVS argument' };
    }

    this.args.PPD_TESTS = !_.isArray(this.args.PPD_TESTS) ? [this.args.PPD_TESTS] : this.args.PPD_TESTS;
    this.args.PPD_ENVS = !_.isArray(this.args.PPD_ENVS) ? [this.args.PPD_ENVS] : this.args.PPD_ENVS;

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
