const path = require('path');
const fs = require('fs');

const _ = require('lodash');
require('polyfill-object.fromentries');
require('array-flat-polyfill');
const dayjs = require('dayjs');
const yaml = require('js-yaml');

const { sleep, stylesConsole } = require('./helpers');
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

  checkLevel(level) {
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

    const { PPD_LOG_LEVEL_TYPE } = new Arguments();

    const inputLevel = _.isNumber(level) ? level : _.get(levels, level, 0);
    const limitLevel = _.get(levels, PPD_LOG_LEVEL_TYPE, 0);

    // If input level higher or equal then logging
    if (limitLevel <= inputLevel || levels[inputLevel] === 'error') {
      return levels[inputLevel];
    } else {
      return false;
    }
  }

  async saveScreenshot({ selCSS = false, fullpage = false, element = false } = {}) {
    try {

      // Active ENV log settings
      let activeEnv = this.envs.getEnv();
      let pageName = this.envs.get('current.page');

      const now = dayjs().format('YYYY-MM-DD_HH-mm-ss.SSS');
      const name = `${now}.png`;

      // TODO: 2020-02-02 S.Starodubov вынести это в функцию
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
          await page.screenshot({ path: pathScreenshot, fullPage: true });
        }
        fs.copyFileSync(pathScreenshot, pathScreenshotLatest);
        // Timeout after screenshot
        await sleep(25);

        // TODO: 2020-02-02 S.Starodubov сделать запись в логе что сделан скриншот
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
    error = {},
    testSource = this.binded.testSource,
    bindedData = this.binded.bindedData,
  }) {

    const {
      PPD_DEBUG_MODE,
      PPD_LOG_DISABLED,
      PPD_LOG_LEVEL_NESTED,
      PPD_LOG_EXTEND,
      PPD_LOG_SCREENSHOT,
      PPD_LOG_FULLPAGE,
    } = new Arguments();

    level = this.checkLevel(level);
    if (!level) return;

    // SKIP LOG BY LEVEL
    if (PPD_LOG_LEVEL_NESTED && levelIndent > PPD_LOG_LEVEL_NESTED && level !== 'error') {
      return;
    }

    try {
      const { folder: outputFolder, folderLatest: outputFolderLatest } = _.get(this.envs, 'output', {});
      if (!outputFolder || !outputFolderLatest) return;

      screenshot = PPD_LOG_SCREENSHOT ? screenshot : false;
      fullpage = PPD_LOG_FULLPAGE ? fullpage : false;

      const now = dayjs().format('HH:mm:ss.SSS');
      let dataEnvsGlobal = null;
      let dataEnvs = null;
      let typeSocket = 'log';

      // LOG STRINGS
      const nowWithPad = `${now} - ${level.padEnd(5)}`;
      const logString = `${nowWithPad} ${' | '.repeat(levelIndent)} ${text}`;
      const errorLogString = [];
      const breadcrumbs = _.get(this.binded, 'testSource.breadcrumbs', []);

      if (level === 'error') {
        breadcrumbs.forEach((v, i) => {
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

        if (breadcrumbs.length && level !== 'raw' && PPD_LOG_EXTEND) {
          const styleFunctionInfo = _.get(stylesConsole, 'info', args => args);
          console.log(
            styleFunction(`${' '.repeat(20)} ${' | '.repeat(levelIndent)}`),
            styleFunctionInfo(`[${breadcrumbs.join(' -> ')}]`),
          );
        }
      }

      // NO LOG FILES ONLY STDOUT
      if (PPD_LOG_DISABLED && level !== 'error') {
        return;
      }

      // ENVS TO LOG
      if (level == 'env') {
        dataEnvsGlobal = _.pick(this.envs, ['args', 'current', 'data', 'results', 'selectors']);
        dataEnvs = _.mapValues(_.get(this.envs, ['envs'], {}), val => {
          return _.omit(val, 'state');
        });
        text = '\n' + text;
        typeSocket = 'env';
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
        // debugger
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
        testStruct: PPD_DEBUG_MODE || typeSocket === 'env' ? testStruct : null,
        screenshots,
        level,
        type: typeSocket,
        bindedData: PPD_DEBUG_MODE ? bindedData : null,
        levelIndent,
        stepId: _.get(bindedData, 'stepId'),
      };
      this.envs.push('log', logEntry);
      this.socket.sendYAML({ type: 'log', data: logEntry, envsId: this.envsId });

      // Export YAML log every step
      let indentYaml = 2;
      let yamlString =
        '-\n' + yaml.dump(logEntry, { lineWidth: 1000, indentYaml }).replace(/^/gm, ' '.repeat(indentYaml)) + '\n';
      fs.appendFileSync(path.join(outputFolder, 'output.yaml'), yamlString);
      fs.appendFileSync(path.join(outputFolderLatest, 'output.yaml'), yamlString);

      if (debug) {
        debugger;
      }
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
