/* eslint-disable max-classes-per-file */
import { Page as PagePuppeteer, Frame as FramePuppeteer } from 'puppeteer';
import { Page as PagePlaywright, Frame as FramePlaywright } from 'playwright';

import {
  BrowserPageType,
  LogOptionsType,
  Element,
  TestArgsType,
  LogFunctionType,
  LogInputType,
  ColorsType,
  BrowserFrame,
} from './global.d';
import { Runner } from './Environment';
import { logArgs, logDebug, logError, logExtend, logExtendFileInfo, logTimer } from './Loggers/CustomLogEntries';

type EnginesType = 'puppeteer' | 'playwright';

type AtomInit = {
  runner?: Runner;
  page?: BrowserPageType | BrowserFrame;
};

const enginesAvailable: EnginesType[] = ['puppeteer', 'playwright'];

class AtomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AtomError';
  }
}

export default class Atom {
  runner: Runner;
  page: BrowserPageType | BrowserFrame;
  log: LogFunctionType;
  levelIndent: number;
  logOptions: LogOptionsType;
  options: Record<string, string>;
  frame: string;

  constructor(init: AtomInit = {}) {
    this.page = init.page || this.page;
    this.runner = init.runner || this.runner;
  }

  getEngine(engine: EnginesType | null): boolean | EnginesType {
    const atomEngine = this.runner.getRunnerData().browser.engine;

    if (!enginesAvailable.includes(atomEngine)) {
      throw new Error(`There is unknown engine: ${atomEngine}. Use this engines: ${enginesAvailable}`);
    }

    return engine ? atomEngine === engine : atomEngine;
  }

  async getElement(
    selector: string,
    allElements = false,
    elementPatent: BrowserPageType | BrowserFrame = this.page,
  ): Promise<Element[] | Element | boolean> {
    if (selector && typeof selector === 'string') {
      const selectorClean = selector
        .replace(/^css[:=]/, '')
        .replace(/^xpath[:=]/, '')
        .replace(/^text[:=]/, '');
      const isXPath = selector.match(/^xpath[:=]/);
      const isText = selector.match(/^text[:=]/);
      const isCSS = (!isXPath && !isText) || selector.match(/^css[:=]/);

      let elements: Array<Element> = [];

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
        const elementParentPlaywright = elementPatent as PagePlaywright;
        if (isXPath) {
          elements = await elementParentPlaywright.$$(`xpath=${selectorClean}`);
        }
        if (isText) {
          elements = await elementParentPlaywright.$$(`text=${selectorClean}`);
        }
        if (isCSS) {
          elements = await elementParentPlaywright.$$(`css=${selectorClean}`);
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
  async atomRun(): Promise<Record<string, unknown>> {
    throw new AtomError('Empty Atom Run');
  }

  async updateFrame(): Promise<void> {
    if (!this.frame) {
      return;
    }

    let elementHandle;

    if (this.getEngine('puppeteer')) {
      const page = this.page as FramePuppeteer;
      elementHandle = await page.$$(`iframe[name="${this.frame}"]`);
    }

    if (this.getEngine('playwright')) {
      const page = this.page as FramePlaywright;
      elementHandle = await page.$$(`iframe[name="${this.frame}"]`);
    }

    const frame = elementHandle && (await elementHandle.contentFrame());

    if (frame) {
      this.page = frame;
    }
  }

  async runTest(args?: TestArgsType): Promise<Record<string, unknown>> {
    const startTime = process.hrtime.bigint();

    const testArgs = Object.entries(args || {});
    testArgs.forEach((entry) => {
      const [key, value] = entry;
      if (Object.prototype.hasOwnProperty.call(args, key)) {
        this[key] = value;
      }
    });

    const logOptionsDefault: LogOptionsType = {
      screenshot: false,
      fullpage: false,
    };

    this.log = async (customLog: LogInputType): Promise<void> => {
      if (args) {
        const logOptions = { ...logOptionsDefault, ...(this.logOptions || {}), ...(customLog.logOptions || {}) };
        const logData = {
          level: 'raw' as ColorsType,
          levelIndent: this.levelIndent + 1,
          logOptions,
          logMeta: { breadcrumbs: args.breadcrumbs },
          ...customLog,
        };
        logData.logOptions.logThis = logData.level === 'error' ? true : logData.logOptions.logThis;
        await args.log(logData);
      }
    };

    try {
      await this.updateFrame();
      const result = await this.atomRun();
      await logTimer(this.log, startTime, this.levelIndent);
      await logExtend(this.log, this.levelIndent, args);
      return result;
    } catch (error) {
      await logTimer(this.log, startTime, this.levelIndent);
      await logError(this.log, error);
      await logExtend(this.log, 0, args, true);
      await logArgs(this.log, 0);
      await logDebug(this.log, args);
      await logExtendFileInfo(this.log, args);

      throw new AtomError('Error in Atom');
    }
  }
}
