/* eslint-disable max-classes-per-file */
import { Page as PagePuppeteer } from 'puppeteer';

import path from 'path';
import { Arguments } from './Arguments';
import Env from './Env';
import { ErrorType } from './Error';

import {
  BrowserPageType,
  EnvsPoolType,
  LogOptionsType,
  Element,
  TestArgsExtType,
  LogFunctionType,
  LogInputType,
  ColorsType,
  BrowserFrame,
} from './global.d';

const enginesAvailable = ['puppeteer', 'playwright'];

type EnginesType = 'puppeteer' | 'playwright';

class AtomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AtomError';
  }
}

export default class Atom {
  env: Env;
  envs: EnvsPoolType;
  page: BrowserPageType | BrowserFrame;
  log: LogFunctionType;

  levelIndent: number;
  logOptions: LogOptionsType;
  data: Record<string, unknown>;
  selectors: Record<string, unknown>;
  dataTest: Record<string, unknown>;
  selectorsTest: Record<string, unknown>;
  bindData: Record<string, string>;
  bindSelectors: Record<string, string>;
  bindResults: Record<string, string>;
  options: Record<string, string>;
  frame: string;

  getEngine(engine: EnginesType | null): boolean | EnginesType {
    const atomEngine = this.env.env.browser.engine;

    if (!enginesAvailable.includes(atomEngine)) {
      throw new Error(`There is unknown engine: ${atomEngine}. Use this engines: ${enginesAvailable}`);
    }

    return engine ? atomEngine === engine : atomEngine;
  }

  async getElement(
    selector: string,
    allElements = false,
    elementPatent: BrowserPageType | BrowserFrame = this.page,
  ): Promise<Element[] | boolean> {
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
        const elementParentPuppeteer = elementPatent as PagePuppeteer;
        if (isXPath) {
          elements = await elementParentPuppeteer.$x(selectorClean);
        }
        if (isText) {
          elements = await elementParentPuppeteer.$x(`//*[text()[contains(.,"${selectorClean}")]]`);
        }
        if (isCSS) {
          elements = await elementParentPuppeteer.$$(selectorClean);
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

  // eslint-disable-next-line class-methods-use-this
  async atomRun(): Promise<void> {
    throw new AtomError('Empty Atom Run');
  }

  async logStack(error: ErrorType): Promise<void> {
    const newError = { ...error };
    newError.stack = error.stack || '';
    const errorStrings = [newError.message, ...newError.stack.split('\n')];
    await this.log({
      text: 'Error in Atom:',
      levelIndent: this.levelIndent + 1,
      level: 'error',
      extendInfo: true,
    });
    for (let i = 0; i < errorStrings.length; i += 1) {
      await this.log({
        text: errorStrings[i],
        levelIndent: this.levelIndent + 2,
        level: 'error',
        extendInfo: true,
      });
    }
  }

  static async logSpliter(logFunction: LogFunctionType, levelIndent = 0): Promise<void> {
    await logFunction({
      text: '='.repeat(120 - (levelIndent + 1) * 3 - 21),
      levelIndent: levelIndent + 1,
      level: 'error',
      extendInfo: true,
    });
  }

  static async logTimer(
    logFunction: LogFunctionType,
    levelIndent = 0,
    startTime: bigint,
    isError = false,
  ): Promise<void> {
    const { PPD_LOG_EXTEND } = new Arguments().args;
    if (PPD_LOG_EXTEND || isError) {
      await logFunction({
        text: `⌛: ${(Number(process.hrtime.bigint() - startTime) / 1e9).toFixed(3)} s.`,
        level: isError ? 'error' : 'timer',
        levelIndent: levelIndent + 1,
        extendInfo: true,
      });
    }
  }

  async logExtend(isError = false): Promise<void> {
    const { PPD_LOG_EXTEND } = new Arguments().args;
    if (PPD_LOG_EXTEND || isError) {
      const dataSources = [
        ['📌📋 (bD):', this.bindData],
        ['📋 (data):', this.dataTest],
        ['☸️ (selectors):', this.selectorsTest],
        ['📌☸️ (bS):', this.bindSelectors],
        ['↩️ (bR):', this.bindResults],
        ['⚙️ (options):', this.options],
      ].filter((v) => typeof v[1] === 'object' && Object.keys(v[1]).length);

      for (let i = 0; i < dataSources.length; i += 1) {
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

  async logDebug(): Promise<void> {
    if (this.data && Object.keys(this.data).length) {
      const dataDebug = JSON.stringify(this.data, null, 2).split('\n');
      await this.log({
        text: '📋 (All Data):',
        levelIndent: this.levelIndent + 1,
        level: 'error',
        extendInfo: true,
        stdOut: false,
      });
      for (let i = 0; i < dataDebug.length; i += 1) {
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
      for (let i = 0; i < selectorsDebug.length; i += 1) {
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

  async logArgs(): Promise<void> {
    const args = Object.entries(new Arguments().args);
    await this.log({
      text: 'Arguments:',
      levelIndent: this.levelIndent + 1,
      level: 'error',
      extendInfo: true,
      stdOut: false,
    });
    for (let i = 0; i < args.length; i += 1) {
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

  async updateFrame(): Promise<void> {
    if (!this.frame) {
      return;
    }

    const elementHandle = await this.page.$(`iframe[name="${this.frame}"]`);
    const frame = await elementHandle.contentFrame();

    if (frame) {
      this.page = frame;
    }
  }

  async runTest(args: TestArgsExtType): Promise<void> {
    const startTime = process.hrtime.bigint();

    const entries = Object.entries(args);
    entries.forEach((entry) => {
      const [key, value] = entry;
      if (Object.prototype.hasOwnProperty.call(args, key)) {
        this[key] = value;
      }
    });

    const logOptionsDefault = {
      screenshot: false,
      fullpage: false,
      level: 'raw' as ColorsType,
      levelIndent: this.levelIndent + 1,
    };
    const logOptions = { ...logOptionsDefault, ...(this.options || {}), ...(this.logOptions || {}) };

    this.log = async (customLog: LogInputType): Promise<void> => {
      await args.log({ ...logOptions, ...customLog });
    };

    try {
      await this.updateFrame();
      const result = await this.atomRun();
      await Atom.logTimer(this.log, this.levelIndent, startTime);
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

      await Atom.logSpliter(this.log, this.levelIndent);
      await Atom.logTimer(this.log, this.levelIndent, startTime, true);
      await this.logExtend(true);
      await this.logDebug();
      await this.logArgs();
      await this.logStack(error);
      await Atom.logSpliter(this.log, this.levelIndent);

      throw new AtomError('Error in Atom');
    }
  }
}
