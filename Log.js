const path = require('path');
const fs = require('fs');

const _ = require('lodash');
require('polyfill-object.fromentries');
require('array-flat-polyfill');
const dayjs = require('dayjs');
const yaml = require('js-yaml');

const { sleep, paintString } = require('./helpers');
const { Arguments } = require('./Arguments');
const Environment = require('./env');

class Log {
  constructor({ envsId } = {}) {
    const { socket, envs, envsId: envsIdNew } = Environment({ envsId: envsId });
    this.envsId = envsIdNew;
    this.envs = envs;
    this.socket = socket;
    this.binded = {};
  }

  bindData(data = {}) {
    if (_.isObject(data)) {
      this.binded = { ...this.binded, ...data };
    }
  }

  checkLevel(level) {
    const levels = {
      0: 'raw',
      1: 'timer',
      2: 'debug',
      3: 'info',
      4: 'test',
      5: 'warn',
      6: 'error',
      7: 'env',
      raw: 0,
      timer: 1,
      debug: 2,
      info: 3,
      test: 4,
      warn: 5,
      error: 6,
      env: 7,
    };

    const { PPD_LOG_LEVEL_TYPE } = new Arguments();

    const inputLevel = _.isNumber(level) ? level : levels[level] || 0;
    const limitLevel = levels[PPD_LOG_LEVEL_TYPE] || 0;

    // If input level higher or equal then logging
    if (limitLevel <= inputLevel || levels[inputLevel] === 'error') {
      return levels[inputLevel];
    } else {
      return false;
    }
  }

  getActivePage() {
    let activeEnv = this.envs.getEnv();
    let pageName = this.envs.get('current.page');
    return _.get(activeEnv, `state.pages.${pageName}`);
  }

  getOutputsFolders() {
    const { folder, folderLatest } = _.get(this.envs, 'output', {});
    if (!folder || !folderLatest) {
      throw { message: 'There is no output folder' };
    }
    return { folder, folderLatest };
  }

  async getScreenshots(selCSS, element, fullpage, extendInfo) {
    if (extendInfo) {
      return [];
    }

    let src;
    const screenshots = [];

    selCSS = selCSS && !_.isArray(selCSS) ? [selCSS.toString()] : selCSS || [];
    for (let css in selCSS) {
      src = await this.saveScreenshot({ selCSS: selCSS[css] });
      src ? screenshots.push(src) : null;
    }
    src = element ? await this.saveScreenshot({ element }) : null;
    src ? screenshots.push(src) : null;
    src = fullpage ? await this.saveScreenshot({ fullpage }) : null;
    src ? screenshots.push(src) : null;
    return screenshots;
  }

  copyScreenshotToLatest(name) {
    const { folder, folderLatest } = this.getOutputsFolders();
    const pathScreenshot = path.join(folder, name);
    const pathScreenshotLatest = path.join(folderLatest, name);
    fs.copyFileSync(pathScreenshot, pathScreenshotLatest);
  }

  async saveScreenshot({ selectors = false, fullpage = false, element = false } = {}) {
    try {
      const name = `${dayjs().format('YYYY-MM-DD_HH-mm-ss.SSS')}.png`;
      const { folder } = this.getOutputsFolders();
      const pathScreenshot = path.join(folder, name);

      if (selectors) {
        const page = this.getActivePage();
        const el = await page.$(selectors);
        await el.screenshot({ path: pathScreenshot });
      }
      if (fullpage) {
        const page = this.getActivePage();
        await page.screenshot({ path: pathScreenshot, fullPage: true });
      }
      if (element && _.isObject(element) && !_.isEmpty(element)) {
        await element.screenshot({ path: pathScreenshot });
      }

      if (fs.existsSync(pathScreenshot)) {
        this.copyScreenshotToLatest(name);
        await sleep(25);
        return name;
      } else {
        return false;
      }
    } catch (err) {
      err.message += ` || saveScreenshot selectors = ${selectors}`;
      err.socket = this.socket;
      throw err;
    }
  }

  makeLog({
    level = 'sane',
    levelIndent = 0,
    text = '',
    now = dayjs(),
    funcFile = null,
    testFile = null,
    extendInfo = false,
    screenshots = [],
  } = {}) {
    const { PPD_LOG_EXTEND } = new Arguments();

    const nowWithPad = `${now.format('HH:mm:ss.SSS')} - ${level.padEnd(5)}`;
    const breadcrumbs = _.get(this.binded, ['testSource', 'breadcrumbs'], []);

    const stringsLog = [
      [
        [
          `${extendInfo && level !== 'error' ? ' '.repeat(20) : nowWithPad} ${' | '.repeat(levelIndent)} `,
          level === 'error' ? 'error' : 'sane',
        ],
        [text, level],
      ],
    ];

    if (breadcrumbs.length && level !== 'raw' && PPD_LOG_EXTEND && level !== 'error' && !extendInfo) {
      const head = `${' '.repeat(20)} ${' | '.repeat(levelIndent)} `;
      const tail = `👣[${breadcrumbs.join(' -> ')}]`;
      stringsLog.push([
        [head, level == 'error' ? 'error' : 'sane'],
        [tail, level == 'error' ? 'error' : 'info'],
      ]);
    }

    if (level === 'error') {
      breadcrumbs.forEach((v, i) => {
        stringsLog.push([[`${nowWithPad} ${' | '.repeat(i)} ${v}`, 'error']]);
      });
      testFile && stringsLog.push([[`${nowWithPad} ${' | '.repeat(levelIndent)} [${testFile}]`, 'error']]);
      funcFile && stringsLog.push([[`${nowWithPad} ${' | '.repeat(levelIndent)} [${funcFile}]`, 'error']]);
    }

    screenshots.forEach(v => {
      stringsLog.push([
        [`${' '.repeat(20)} ${' | '.repeat(levelIndent)} `, level == 'error' ? 'error' : 'sane'],
        [`🖼 screenshot: [${v}]`, level == 'error' ? 'error' : 'info'],
      ]);
    });

    return stringsLog;
  }

  consoleLog(entries = []) {
    entries.forEach(entry => {
      const line = entry.map(part => paintString(part[0], part[1] || 'sane')).join('');
      console.log(line);
    });
  }

  fileLog(texts = [], fileName = 'output.log') {
    const { folder, folderLatest } = this.getOutputsFolders();

    let textsJoin = '';
    if (_.isArray(texts)) {
      textsJoin = texts.map(text => text.map(log => log[0] || '').join('')).join('\n');
    } else {
      textsJoin = texts.toString();
    }

    fs.appendFileSync(path.join(folder, fileName), textsJoin + '\n');
    fs.appendFileSync(path.join(folderLatest, fileName), textsJoin + '\n');
  }

  async log({
    funcFile,
    testFile,
    text = '',
    selCSS = [],
    screenshot = null,
    fullpage = null,
    level = 'info',
    element = false,
    testStruct = null,
    levelIndent = 0,
    error = {},
    testSource = this.binded.testSource,
    bindedData = this.binded.bindedData,
    extendInfo = false,
  } = {}) {
    const {
      PPD_DEBUG_MODE,
      PPD_LOG_DISABLED,
      PPD_LOG_LEVEL_NESTED,
      PPD_LOG_SCREENSHOT,
      PPD_LOG_FULLPAGE,
    } = new Arguments();

    level = this.checkLevel(level);
    if (!level) return;

    // SKIP LOG BY LEVEL
    if (PPD_LOG_LEVEL_NESTED && levelIndent > PPD_LOG_LEVEL_NESTED && level !== 'error') {
      return;
    }

    // NO LOG FILES ONLY STDOUT
    if (PPD_LOG_DISABLED && level !== 'error') {
      return;
    }

    try {
      // SCREENSHOT ON ERROR ONLY ONES
      // TODO: 2020-02-05 S.Starodubov get values from env.yaml
      screenshot = PPD_LOG_SCREENSHOT ? screenshot : false;
      fullpage = PPD_LOG_FULLPAGE ? fullpage : false;

      if (level === 'error' && levelIndent === 0) {
        [screenshot, fullpage] = [true, true];
      }
      const screenshots = screenshot ? await this.getScreenshots(selCSS, element, fullpage, extendInfo) : [];

      const now = dayjs();
      const logTexts = this.makeLog({ level, levelIndent, text, now, funcFile, testFile, extendInfo, screenshots });

      // STDOUT
      this.consoleLog(logTexts);

      // EXPORT TEXT LOG
      this.fileLog(logTexts, 'output.log');

      // ENVS TO LOG
      let dataEnvs = null;
      if (level == 'env') {
        dataEnvs = _.mapValues(_.get(this.envs, ['envs'], {}), val => {
          return _.omit(val, 'state');
        });
      }

      if (_.isEmpty(testStruct)) {
        testStruct = _.mapValues(testSource, v => {
          if (!_.isEmpty(v)) {
            return v;
          }
        });
      }

      const logEntry = {
        text,
        time: now.format('YYYY-MM-DD_HH-mm-ss.SSS'),
        // TODO: 2020-02-02 S.Starodubov this two fields need for html
        dataEnvs,
        dataEnvsGlobal: level == 'env' ? _.pick(this.envs, ['args', 'current', 'data', 'results', 'selectors']) : null,
        testStruct: PPD_DEBUG_MODE || level == 'env' ? testStruct : null,
        bindedData: PPD_DEBUG_MODE ? bindedData : null,
        screenshots,
        type: level == 'env' ? 'env' : 'log',
        level,
        levelIndent,
        stepId: _.get(bindedData, 'stepId'),
      };
      this.envs.push('log', logEntry);
      this.socket.sendYAML({ type: 'log', data: logEntry, envsId: this.envsId });

      // Export YAML log every step
      let yamlString = '-\n' + yaml.dump(logEntry, { lineWidth: 1000, indent: 2 }).replace(/^/gm, ' '.repeat(2));
      this.fileLog(yamlString, 'output.yaml');
    } catch (err) {
      err.message += ' || error in log';
      err.socket = this.socket;
      err.debug = PPD_DEBUG_MODE;
      err.stepId = _.get(bindedData, 'stepId');
      throw err;
    }
  }
}

module.exports = Log;
