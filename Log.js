const path = require('path');
const fs = require('fs');

const _ = require('lodash');
require('polyfill-object.fromentries');
require('array-flat-polyfill');
const dayjs = require('dayjs');
const yaml = require('js-yaml');

// const { sleep, stylesConsole, blankSocket } = require('./helpers');
// const Singleton = require('./singleton');
const { Arguments } = require('./Arguments');
const Environment = require('./env');

class Log {
  constructor({ envsId } = {}) {
    this.init(envsId);
  }

  init(envsId) {
    const { socket, envs } = Environment({ envsId });
    this.envs = envs;
    this.socket = socket;
    this.binded = {};
  }

  bindData(data = {}) {
    this.binded = { ...this.binded, ...data };
  }

  getLevel(level) {
    const levels = {
      0: 'raw',
      1: 'debug',
      2: 'info',
      3: 'test',
      4: 'warn',
      5: 'error',
      6: 'env',
      raw: 0,
      debug: 1,
      info: 2,
      test: 3,
      warn: 4,
      error: 5,
      env: 6,
    };

    const args = new Arguments();

    // let defaultLevel = 1;

    // Active ENV log settings
    // let activeEnv = this.envs.getEnv();
    // let activeLog = _.get(activeEnv, 'env.log', {});

    // let envLevel = _.get(activeLog, 'level', defaultLevel);
    // envLevel = _.isNumber(envLevel) ? envLevel : _.get(levels, envLevel, defaultLevel);
    // let inputLevel = level;
    // inputLevel = _.isNumber(inputLevel) ? inputLevel : _.get(levels, inputLevel, defaultLevel);

    // let inputLevelText = levels[inputLevel];

    // // If input level higher or equal then global env level then logging
    // if (envLevel > inputLevel) {
    //   return false;
    // } else {
    //   return inputLevelText;
    // }
  }

  async log({
    funcFile,
    testFile,
    text = '',
    stdOut = true,
    selCSS = [],
    screenshot = null,
    fullpage = null,
    level = 'info',
    debug = false,
    element = false,
    testStruct = null,
    levelIndent = 0,
    // testSource = {},
    // bindedData = {},
  }) {
    const {PPD_DEBUG_MODE, PPD_LOG_DISABLED, PPD_LOG_LEVEL_NESTED, PPD_LOG_TIMER} = new Arguments();
    debugger;

    try {
      let activeEnv = this.envs.getEnv();
      let activeLog = _.get(activeEnv, 'env.log', {});
      let debugMode = this.envs.get('args.PPD_DEBUG_MODE');

      let outputFolder = this.envs.get('output.folder');
      let outputFolderLatest = this.envs.get('output.folderLatest');
      if (!outputFolder || !outputFolderLatest) return;

      if (!_.get(activeLog, 'screenshot')) {
        screenshot = false;
      }
      if (!_.get(activeLog, 'fullpage')) {
        fullpage = false;
      }
      const now = dayjs().format('HH:mm:ss.SSS');
      let dataEnvsGlobal = null;
      let dataEnvs = null;
      let type = 'log';

      const isExtendLog = _.get(this.envs, ['args', 'PPD_LOG_TIMER'], false);
      const levelIndentMax = _.get(this.envs, ['args', 'PPD_LOG_LEVEL_NESTED'], 0);

      // LEVEL RULES
      level = this.getLevel(level);
      if (!level) return;

      // SKIP LOG BY LEVEL
      if (levelIndentMax && levelIndent > levelIndentMax && level !== 'error') {
        return
      }

      // LOG STRINGS
      const nowWithPad = `${now} - ${level.padEnd(5)}`;
      const logString = `${nowWithPad} ${' | '.repeat(levelIndent)} ${text}`;
      const errorLogString = [];
      if (level === 'error') {
        (testSource.breadcrumbs || []).forEach((v, i) => {
          errorLogString.push(`${nowWithPad} ${' | '.repeat(i)} ${v}`);
        });
        testFile && errorLogString.push(`${nowWithPad} ${' | '.repeat(levelIndent)} [${testFile}]`);
        funcFile && errorLogString.push(`${nowWithPad} ${' | '.repeat(levelIndent)} [${funcFile}]`);
      }
      const fullLogString = [...errorLogString, logString].join('\n');

      // STDOUT
      if (stdOut) {
        const styleFunction = _.get(stylesConsole, level, args => args);
        console.log(styleFunction(fullLogString));

        // TODO: 2020-01-31 S.Starodubov make flag for this
        if (testSource.breadcrumbs && testSource.breadcrumbs.length && level !== 'raw' && isExtendLog) {
          const styleFunctionInfo = _.get(stylesConsole, 'info', args => args);
          console.log(
            styleFunction(`${' '.repeat(20)} ${' | '.repeat(levelIndent)}`),
            styleFunctionInfo(`[${testSource.breadcrumbs.join(' -> ')}]`),
          );
        }
      }

      // NO LOG FILES ONLY STDOUT
      if (this.envs.get('args.PPD_LOG_DISABLED')) {
        return;
      }

      // ENVS TO LOG
      if (level == 'env') {
        dataEnvsGlobal = _.pick(this.envs, ['args', 'current', 'data', 'results', 'selectors']);
        dataEnvs = _.mapValues(_.get(this.envs, ['envs'], {}), val => {
          return _.omit(val, 'state');
        });
        text = '\n' + text;
        type = 'env';
      }

      // EXPORT TEXT LOG
      fs.appendFileSync(path.join(outputFolder, 'output.log'), fullLogString + '\n');
      fs.appendFileSync(path.join(outputFolderLatest, 'output.log'), fullLogString + '\n');

      if (_.isEmpty(testStruct)) {
        testStruct = _.mapValues(testSource, v => {
          if (!_.isEmpty(v)) {
            return v;
          }
        });
      }

      // SCREENSHOT ON ERROR
      if (level === 'error') {
        [screenshot, fullpage] = [true, true];
      }

      // SCRENSHOTS
      const screenshots = [];
      if (screenshot) {
        let src;
        selCSS = selCSS && !_.isArray(selCSS) ? [selCSS.toString()] : selCSS || [];
        for (let css in selCSS) {
          src = await this.saveScreenshot({ selCSS: selCSS[css] });
          src ? screenshots.push(src) : null;
        }
        src = element ? await this.saveScreenshot({ element }) : null;
        src ? screenshots.push(src) : null;
        src = fullpage ? await this.saveScreenshot({ fullpage }) : null;
        src ? screenshots.push(src) : null;
      }

      const logEntry = {
        text,
        time: now,
        dataEnvs,
        dataEnvsGlobal,
        testStruct: debugMode || type === 'env' ? testStruct : null,
        screenshots,
        level,
        type,
        bindedData: debugMode ? bindedData : null,
        levelIndent,
        stepId: _.get(bindedData, 'stepId'),
      };
      this.envs.push('log', logEntry);
      this.socket.sendYAML({ type: 'log', data: logEntry, envsId: this.envsId });

      // Export YAML log every step
      let indent = 2;
      let yamlString =
        '-\n' + yaml.dump(logEntry, { lineWidth: 1000, indent }).replace(/^/gm, ' '.repeat(indent)) + '\n';
      fs.appendFileSync(path.join(outputFolder, 'output.yaml'), yamlString);
      fs.appendFileSync(path.join(outputFolderLatest, 'output.yaml'), yamlString);

      if (debug) {
        debugger;
      }
    } catch (err) {
      err.message += ' || error in _log';
      err.socket = this.socket;
      err.debug = _.get(this.envs, ['args', 'PPD_DEBUG_MODE']);
      err.stepId = _.get(bindedData, 'stepId');
      throw err;
    }
  }
}

module.exports = Log;
