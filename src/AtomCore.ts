/* eslint-disable max-classes-per-file */
import { Page as PagePuppeteer, Frame as FramePuppeteer } from 'puppeteer';
import { Page as PagePlaywright, Frame as FramePlaywright } from 'playwright';

import { logExtend, logDebug, logArgs, logStack, logTimer, logExtendFileInfo, logErrorMessage } from './Log';
import Env from './Env';

import {
  BrowserPageType,
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
  env!: Env;
  page!: BrowserPageType | BrowserFrame;
  log!: LogFunctionType;

  levelIndent!: number;
  logOptions!: LogOptionsType;
  options!: Record<string, string>;
  frame!: string;

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

  async runTest(args?: TestArgsExtType): Promise<Record<string, unknown>> {
    const startTime = process.hrtime.bigint();

    const entries = Object.entries(args || {});
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
      if (args) {
        await args.log({ ...logOptions, ...customLog });
      }
    };

    try {
      await this.updateFrame();
      const result = await this.atomRun();
      await logTimer(this.log, this.levelIndent, startTime);
      await logExtend(this.log, this.levelIndent, args);
      return result;
    } catch (error) {
      await logTimer(this.log, this.levelIndent, startTime);
      await logErrorMessage(this.log, 0, error);
      await logStack(this.log, 0, error);
      await logExtend(this.log, 0, args, true);
      await logArgs(this.log, 0);
      await logDebug(this.log, 0, args);
      await logExtendFileInfo(this.log, 0, (args || {}).envsId);

      throw new AtomError('Error in Atom');
    }
  }
}
