/* eslint-disable max-classes-per-file */
const path = require('path');

const enginesAvailable = ['puppeteer', 'playwright'];

class AtomError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AtomError';
  }
}

export default class Atom {
  getEngine(engine) {
    const atomEngine = this.env.env.browser.engine;

    if (!enginesAvailable.includes(atomEngine)) {
      throw new Error(`There is unknown engine: ${atomEngine}. Use this engines: ${enginesAvailable}`);
    }

    return engine ? atomEngine === engine : atomEngine;
  }

  async getElement(selector, allElements = false, elementPatent = null) {
    if (!elementPatent) {
      elementPatent = this.page;
    }

    if (selector && typeof selector === 'string') {
      const selectorClean = selector
        .replace(/^css[:=]/, '')
        .replace(/^xpath[:=]/, '')
        .replace(/^text[:=]/, '');
      const isXPath = selector.match(/^xpath[:=]/);
      const isText = selector.match(/^text[:=]/);
      const isCSS = (!isXPath && !isText) || selector.match(/^css[:=]/);

      let elements = [];

      if (this.getEngine('puppeteer')) {
        if (isXPath) {
          elements = await elementPatent.$x(selectorClean);
        }
        if (isText) {
          elements = await elementPatent.$x(`//\*[text()[contains(.,"${selectorClean}")]]`);
        }
        if (isCSS) {
          elements = await elementPatent.$$(selectorClean);
        }
      }

      if (this.getEngine('playwright')) {
        if (isXPath) {
          elements = await elementPatent.$$(`xpath=${selectorClean}`);
        }
        if (isText) {
          elements = await elementPatent.$$(`text=${selectorClean}`);
        }
        if (isCSS) {
          elements = await elementPatent.$$(`css=${selectorClean}`);
        }
      }

      if (!allElements && elements.length) {
        return elements[0];
      }

      return elements;
    }
    return false;
  }

  async atomRun() {
    throw new AtomError('Empty Atom Run');
  }

  async logStack(error) {
    error.stack = error.stack || '';
    const errorStrings = [error.message, ...error.stack.split('\n')];
    await this.log({
      text: 'Error in Atom:',
      levelIndent: this.levelIndent + 1,
      level: 'error',
      extendInfo: true,
    });
    for (let i = 0; i < errorStrings.length; i++) {
      await this.log({
        text: errorStrings[i],
        levelIndent: this.levelIndent + 2,
        level: 'error',
        extendInfo: true,
      });
    }
  }

  async logSpliter() {
    await this.log({
      text: '='.repeat(120 - (this.levelIndent + 1) * 3 - 21),
      levelIndent: this.levelIndent + 1,
      level: 'error',
      extendInfo: true,
    });
  }

  async logTimer(startTime, isError = false) {
    const PPD_LOG_EXTEND = (this.envs.args || {}).PPD_LOG_EXTEND || false;
    if (PPD_LOG_EXTEND || isError) {
      await this.log({
        text: `⌛: ${(Number(process.hrtime.bigint() - startTime) / 1e9).toFixed(3)} s.`,
        level: isError ? 'error' : 'timer',
        levelIndent: this.levelIndent + 1,
        extendInfo: true,
      });
    }
  }

  async logExtend(isError = false) {
    const PPD_LOG_EXTEND = (this.envs.args || {}).PPD_LOG_EXTEND || false;
    if (PPD_LOG_EXTEND || isError) {
      const dataSources = [
        ['📌📋 (bD):', this.bindData],
        ['📋 (data):', this.dataTest],
        ['☸️ (selectors):', this.selectorsTest],
        ['📌☸️ (bS):', this.bindSelectors],
        ['↩️ (bR):', this.bindResults],
        ['⚙️ (options):', this.options],
      ].filter((v) => typeof v[1] === 'object' && Object.keys(v[1]).length);

      for (let i = 0; i < dataSources.length; i++) {
        const [text, object] = dataSources[i];
        await this.log({
          text: `${text} ${JSON.stringify(object)}`,
          levelIndent: this.levelIndent + 1,
          level: isError ? 'error' : 'info',
          extendInfo: true,
        });
      }
    }
  }

  async logDebug() {
    if (this.data && Object.keys(this.data).length) {
      const dataDebug = JSON.stringify(this.data, null, 2).split('\n');
      await this.log({
        text: '📋 (All Data):',
        levelIndent: this.levelIndent + 1,
        level: 'error',
        extendInfo: true,
        stdOut: false,
      });
      for (let i = 0; i < dataDebug.length; i++) {
        await this.log({
          text: dataDebug[i],
          levelIndent: this.levelIndent + 2,
          level: 'error',
          extendInfo: true,
          stdOut: false,
        });
      }
    }
    if (this.selectors && Object.keys(this.selectors).length) {
      const selectorsDebug = JSON.stringify(this.selectors, null, 2).split('\n');
      await this.log({
        text: '☸️ (All Selectors):',
        levelIndent: this.levelIndent + 1,
        level: 'error',
        extendInfo: true,
        stdOut: false,
      });
      for (let i = 0; i < selectorsDebug.length; i++) {
        await this.log({
          text: selectorsDebug[i],
          levelIndent: this.levelIndent + 2,
          level: 'error',
          extendInfo: true,
          stdOut: false,
        });
      }
    }
  }

  async logArgs() {
    const args = Object.entries(this.envs.args);
    await this.log({
      text: 'Arguments:',
      levelIndent: this.levelIndent + 1,
      level: 'error',
      extendInfo: true,
      stdOut: false,
    });
    for (let i = 0; i < args.length; i++) {
      const [key, val] = args[i];
      await this.log({
        text: `${key}: ${JSON.stringify(val)}`,
        levelIndent: this.levelIndent + 2,
        level: 'error',
        extendInfo: true,
        stdOut: false,
      });
    }
  }

  async updateFrame() {
    if (!this.frame) {
      return;
    }

    const elementHandle = await this.page.$(`iframe[name="${this.frame}"]`);
    const frame = await elementHandle.contentFrame();

    if (frame) {
      this.page = frame;
    }
  }

  async runTest(args = {}) {
    const startTime = process.hrtime.bigint();

    for (const key in args) {
      if (args.hasOwnProperty(key)) {
        this[key] = args[key];
      }
    }

    const logOptionsDefault = {
      screenshot: false,
      fullpage: false,
      level: 'raw',
      levelIndent: this.levelIndent + 1,
    };
    const logOptions = { ...logOptionsDefault, ...(this.options || {}), ...(this.logOptions || {}) };

    this.log = async function (customLog) {
      await args.log({
        ...logOptions,
        ...customLog,
      });
    };

    try {
      await this.updateFrame();
      const result = await this.atomRun();
      await this.logTimer(startTime);
      await this.logExtend();
      return result;
    } catch (error) {
      const outputFile = path.join(this.envs.output.folderFull, 'output.log');
      await this.log({
        text: `Extend information you can reached in log file: \u001B[42mfile:///${outputFile}\u001B[0m`,
        levelIndent: this.levelIndent + 1,
        level: 'error',
        extendInfo: true,
      });
      await this.log({
        text: error.message,
        levelIndent: this.levelIndent + 1,
        level: 'error',
      });

      await this.logSpliter();
      await this.logTimer(startTime, true);
      await this.logExtend(true);
      await this.logDebug();
      await this.logArgs();
      await this.logStack(error);
      await this.logSpliter();

      throw new AtomError('Error in Atom');
    }
  }
}
