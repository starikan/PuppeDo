const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const dayjs = require('dayjs');
const yaml = require('js-yaml');

const { sleep, stylesConsole } = require('./helpers');

class Logger {
  constructor({ envs, envsId, socket }) {

    if (!socket) {
      socket = {
        send: () => {},
        sendYAML: () => {},
      };
    }

    this.envs = envs;
    this.envsId = envsId;
    this.socket = socket;
  }

  async saveScreenshot({ selCSS = false, fullpage = false, element = false } = {}) {
    try {
      // Active ENV log settings
      let activeEnv = this.envs.getEnv();
      let pageName = this.envs.get('current.page');

      const now = dayjs().format('YYYY-MM-DD_HH-mm-ss.SSS');
      const name = `${now}.jpg`;

      if (!this.envs.get('output.folder') || !this.envs.get('output.folderLatest')) {
        console.log('There is no output folder for screenshot');
        return;
      }

      const pathScreenshot = path.join(this.envs.get('output.folder'), name);
      const pathScreenshotLatest = path.join(this.envs.get('output.folderLatest'), name);

      const page = _.get(activeEnv, `state.pages.${pageName}`);

      if (_.isObject(page)) {
        if (selCSS) {
          const el = await page.$(selCSS);
          await el.screenshot({ path: pathScreenshot });
        }
        if (element && _.isObject(element) && !_.isEmpty(element)) {
          await element.screenshot({ path: pathScreenshot });
        }
        if (fullpage) {
          await page.screenshot({ path: pathScreenshot, fullPage: fullpage });
        }
        fs.copyFileSync(pathScreenshot, pathScreenshotLatest);
        // Timeout after screenshot
        await sleep(25);
        return name;
      } else {
        return false;
      }
    } catch (err) {
      err.message += ` || saveScreenshot selCSS = ${selCSS}`;
      err.socket = this.socket;
      throw err;
    }
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

    let defaultLevel = 1;

    // Active ENV log settings
    let activeEnv = this.envs.getEnv();
    let activeLog = _.get(activeEnv, 'env.log', {});

    let envLevel = _.get(activeLog, 'level', defaultLevel);
    envLevel = _.isNumber(envLevel) ? envLevel : _.get(levels, envLevel, defaultLevel);
    let inputLevel = level;
    inputLevel = _.isNumber(inputLevel) ? inputLevel : _.get(levels, inputLevel, defaultLevel);

    let inputLevelText = levels[inputLevel];

    // If input level higher or equal then global env level then logging
    if (envLevel > inputLevel) {
      return false;
    } else {
      return inputLevelText;
    }
  }

  async _log(
    {
      text = '',
      pageNum = 0,
      stdOut = true,
      selCSS = [],
      screenshot = null,
      fullpage = null,
      level = 'info',
      debug = false,
      element = false,
      testStruct = null,
      levelIndent = 0,
      funcFile,
      testFile,
    } = {},
    testSource,
    bindedData,
  ) {
    try {
      let activeEnv = this.envs.getEnv();
      let activeLog = _.get(activeEnv, 'env.log', {});
      let debugMode = this.envs.get('args.PPD_DEBUG_MODE');

      let outputFolder = this.envs.get('output.folder');
      let outputFolderLatest = this.envs.get('output.folderLatest');
      if (!outputFolder || !outputFolderLatest) return;

      const screenshots = [];
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

      // LEVEL RULES
      level = this.getLevel(level);
      if (!level) return;

      // LOG STRINGS
      const logString = `${now} - ${level.padEnd(5)} ${' | '.repeat(levelIndent)} ${text}`;

      // STDOUT
      if (stdOut) {
        const styleFunction = _.get(stylesConsole, level, args => args);
        // TODO: console.table
        console.log(styleFunction(logString));
        if (level === 'error') {
          if (testFile) console.log('Файл с тестом:', styleFunction(testFile));
          if (funcFile) console.log('Файл с функцией:', styleFunction(funcFile));
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
      fs.appendFileSync(path.join(outputFolder, 'output.log'), logString + '\n');
      fs.appendFileSync(path.join(outputFolderLatest, 'output.log'), logString + '\n');

      if (_.isEmpty(testStruct)) {
        testStruct = testSource;
        testStruct = _.mapValues(testStruct, v => {
          if (!_.isEmpty(v)) {
            return v;
          }
        });
      }

      // SCRENSHOTS
      if (screenshot) {
        let src;
        selCSS = selCSS && !_.isArray(selCSS) ? [selCSS.toString()] : selCSS || [];
        for (let css in selCSS) {
          src = await this.saveScreenshot({ selCSS: selCSS[css] });
          src ? screenshots.push(src) : null;
        }
        src = element ? await this.saveScreenshot({ element: element }) : null;
        src ? screenshots.push(src) : null;
        src = fullpage ? await this.saveScreenshot({ fullpage: fullpage }) : null;
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
        (await '-\n') + yaml.dump(logEntry, { lineWidth: 1000, indent }).replace(/^/gm, ' '.repeat(indent)) + '\n';
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
      debugger;
      throw err;
    }
  }
}

module.exports = function({ envs, envsId = null, socket = null }) {
  if (!envs) {
    throw { message: 'Logger need ENVS' };
  }

  const logger = new Logger({ envs, socket, envsId });
  return logger._log.bind(logger);
};
