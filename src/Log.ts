const path = require('path');
const fs = require('fs');

const _ = require('lodash');
require('polyfill-object.fromentries');
require('array-flat-polyfill');
const dayjs = require('dayjs');
const yaml = require('js-yaml');

const { paintString } = require('./Helpers.js');
const { Arguments } = require('./Arguments.js');
const { Screenshot } = require('./Screenshot.js');
const Environment = require('./Environment.js');

class Log {
  constructor({ envsId } = {}) {
    const { socket, envs, envsId: envsIdNew } = Environment({ envsId });
    this.envsId = envsIdNew;
    this.envs = envs;
    this.socket = socket;
    this.binded = {};
    this.screenshot = new Screenshot({ envsId });
  }

  bindData(data = {}) {
    if (_.isObject(data)) {
      this.binded = { ...this.binded, ...data };
    }
  }

  static checkLevel(level) {
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

    const { PPD_LOG_LEVEL_TYPE, PPD_LOG_LEVEL_TYPE_IGNORE } = new Arguments();

    const inputLevel = _.isNumber(level) ? level : levels[level] || 0;
    const limitLevel = levels[PPD_LOG_LEVEL_TYPE] || 0;
    const ignoreLevels = PPD_LOG_LEVEL_TYPE_IGNORE.map((v) => levels[v]);

    if (ignoreLevels.includes(inputLevel)) {
      return false;
    }

    // If input level higher or equal then logging
    if (limitLevel <= inputLevel || levels[inputLevel] === 'error') {
      return levels[inputLevel];
    }
    return false;
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
    error = {},
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
        [head, level === 'error' ? 'error' : 'sane'],
        [tail, level === 'error' ? 'error' : 'info'],
      ]);

      const repeat = _.get(this, 'binded.bindedData.repeat', 1);
      if (repeat > 1) {
        stringsLog.push([
          [head, level === 'error' ? 'error' : 'sane'],
          [`🔆 repeats left: ${repeat - 1}`, level === 'error' ? 'error' : 'info'],
        ]);
      }
    }

    if (level === 'error' && !extendInfo) {
      breadcrumbs.forEach((v, i) => {
        stringsLog.push([[`${nowWithPad} ${' | '.repeat(levelIndent)}${'   '.repeat(i)} ${v}`, 'error']]);
      });
      if (testFile) {
        stringsLog.push([[`${nowWithPad} ${' | '.repeat(levelIndent)} (file:///${path.resolve(testFile)})`, 'error']]);
      }
      if (funcFile) {
        stringsLog.push([[`${nowWithPad} ${' | '.repeat(levelIndent)} (file:///${path.resolve(funcFile)})`, 'error']]);
      }
    }

    screenshots.forEach((v) => {
      stringsLog.push([
        [`${nowWithPad} ${' | '.repeat(levelIndent)} `, level === 'error' ? 'error' : 'sane'],
        [`🖼 screenshot: [${v}]`, level === 'error' ? 'error' : 'info'],
      ]);
    });

    if (level === 'error' && !extendInfo) {
      stringsLog.push([
        [`${nowWithPad} ${' | '.repeat(levelIndent)} `, level === 'error' ? 'error' : 'sane'],
        ['='.repeat(120 - (levelIndent + 1) * 3 - 21), level === 'error' ? 'error' : 'info'],
      ]);
    }

    if (level === 'error' && !extendInfo && levelIndent === 0) {
      const message = (error.message || '').split(' || ');
      const stack = (error.stack || '').split('\n    ');

      [...message, '='.repeat(120 - (levelIndent + 1) * 3 - 21), ...stack].forEach((v) => {
        stringsLog.push([
          [' '.repeat(22), 'error'],
          [v, 'error'],
        ]);
      });
    }

    return stringsLog;
  }

  static consoleLog(entries = []) {
    entries.forEach((entry) => {
      const line = entry.map((part) => paintString(part[0], part[1] || 'sane')).join('');
      // eslint-disable-next-line no-console
      console.log(line);
    });
  }

  fileLog(texts = [], fileName = 'output.log') {
    const { folder, folderLatest } = this.envs.getOutputsFolders();

    let textsJoin = '';
    if (_.isArray(texts)) {
      textsJoin = texts.map((text) => text.map((log) => log[0] || '').join('')).join('\n');
    } else {
      textsJoin = texts.toString();
    }

    // eslint-disable-next-line no-control-regex
    textsJoin = textsJoin.replace(new RegExp(/\[\d+m/gi), '');

    fs.appendFileSync(path.join(folder, fileName), `${textsJoin}\n`);
    fs.appendFileSync(path.join(folderLatest, fileName), `${textsJoin}\n`);
  }

  async log({
    funcFile,
    testFile,
    text = '',
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
    stdOut = true,
  } = {}) {
    const {
      PPD_DEBUG_MODE,
      PPD_LOG_DISABLED,
      PPD_LOG_LEVEL_NESTED,
      PPD_LOG_SCREENSHOT,
      PPD_LOG_FULLPAGE,
    } = new Arguments();

    const levelText = Log.checkLevel(level);
    if (!levelText) return;

    // SKIP LOG BY LEVEL
    if (PPD_LOG_LEVEL_NESTED && levelIndent > PPD_LOG_LEVEL_NESTED && levelText !== 'error') {
      return;
    }

    // NO LOG FILES ONLY STDOUT
    if (PPD_LOG_DISABLED && levelText !== 'error') {
      return;
    }

    try {
      // SCREENSHOT ON ERROR ONLY ONES
      // TODO: 2020-02-05 S.Starodubov get values from env.yaml
      let isScreenshot = PPD_LOG_SCREENSHOT ? screenshot : false;
      let isFullpage = PPD_LOG_FULLPAGE ? fullpage : false;

      if (level === 'error' && levelIndent === 0) {
        [isScreenshot, isFullpage] = [true, true];
      }
      const screenshots = isScreenshot ? await this.screenshot.getScreenshots(element, isFullpage, extendInfo) : [];

      const now = dayjs();
      const logTexts = this.makeLog({
        level: levelText,
        levelIndent,
        text,
        now,
        funcFile,
        testFile,
        extendInfo,
        screenshots,
        error,
      });

      // STDOUT
      if (stdOut) Log.consoleLog(logTexts);

      // EXPORT TEXT LOG
      this.fileLog(logTexts, 'output.log');

      // ENVS TO LOG
      let dataEnvs = null;
      if (level === 'env') {
        dataEnvs = _.mapValues(_.get(this.envs, ['envs'], {}), (val) => _.omit(val, 'state'));
      }

      if (_.isEmpty(testStruct)) {
        testStruct = _.mapValues(testSource, (v) => {
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
        dataEnvsGlobal: level === 'env' ? _.pick(this.envs, ['args', 'current', 'data', 'results', 'selectors']) : null,
        testStruct: PPD_DEBUG_MODE || level === 'env' ? testStruct : null,
        bindedData: PPD_DEBUG_MODE ? bindedData : null,
        screenshots,
        type: level === 'env' ? 'env' : 'log',
        level,
        levelIndent,
        stepId: _.get(bindedData, 'stepId'),
      };
      this.envs.push('log', logEntry);
      this.socket.sendYAML({ type: 'log', data: logEntry, envsId: this.envsId });

      // Export YAML log every step
      const yamlString = `-\n${yaml.dump(logEntry, { lineWidth: 1000, indent: 2 }).replace(/^/gm, ' '.repeat(2))}`;
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

module.exports = { Log };
