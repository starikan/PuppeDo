import type { Frame as FramePlaywright, Page as PagePlaywright } from 'playwright';
import type { Frame as FramePuppeteer, Page as PagePuppeteer } from 'puppeteer';
import { ENGINES_AVAILABLE } from './Defaults';
import { Environment, type Runner } from './Environment';
import { logArgs, logDebug, logError, logExtend, logExtendFileInfo, logTimer } from './Loggers/CustomLogEntries';
import type {
  AgentData,
  AtomInit,
  BrowserFrame,
  BrowserPageType,
  ColorsType,
  Element,
  EnginesType,
  LogFunctionType,
  LogInputType,
  LogOptionsType,
  TestArgsType,
} from './model';
import type { PluginFrame } from './Plugins';

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

  constructor(init: AtomInit = {}) {
    this.page = init.page || this.page;
    this.runner = init.runner || this.runner;
  }

  getEngine(engine: EnginesType | null): boolean | EnginesType {
    const atomEngine = this.runner.getRunnerData().browser.engine;

    if (!ENGINES_AVAILABLE.includes(atomEngine)) {
      throw new Error(`There is unknown engine: ${atomEngine}. Use this engines: ${ENGINES_AVAILABLE}`);
    }

    return engine ? atomEngine === engine : atomEngine;
  }

  async getElement(
    selector: string,
    allElements = false,
    elementPatent: BrowserPageType | BrowserFrame = this.page,
  ): Promise<Element[] | Element | false> {
    if (selector && typeof selector === 'string') {
      const isXPath = selector.match(/^xpath[:=]/);
      const isText = selector.match(/^text[:=]/);
      const isCSS = (!isXPath && !isText) || selector.match(/^css[:=]/);

      let elements: Array<Element> = [];

      if (this.getEngine('puppeteer')) {
        const selectorClean = selector
          .replace(/^css[:=]/, '')
          .replace(/^xpath[:=]/, 'xpath/.')
          .replace(/^text[:=]/, '');
        const elementParentPuppeteer = elementPatent as PagePuppeteer;
        if (isXPath) {
          elements = await elementParentPuppeteer.$$(selectorClean);
        }
        if (isText) {
          elements = await elementParentPuppeteer.$$(`//*[text()[contains(.,"${selectorClean}")]]`);
        }
        if (isCSS) {
          elements = await elementParentPuppeteer.$$(selectorClean);
        }
      }

      if (this.getEngine('playwright')) {
        const selectorClean = selector
          .replace(/^css[:=]/, '')
          .replace(/^xpath[:=]/, '')
          .replace(/^text[:=]/, '');
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

  async atomRun(): Promise<Record<string, unknown>> {
    throw new AtomError('Empty Atom Run');
  }

  async updateFrame(agent: AgentData): Promise<void> {
    const { plugins } = new Environment().getEnvInstance(agent.envsId);

    const { frame } = plugins.getPlugins<PluginFrame>('frame').getValues(agent.stepId);
    if (!frame) {
      return;
    }

    let elementHandle;

    if (this.getEngine('puppeteer')) {
      const page = this.page as FramePuppeteer;
      elementHandle = await page.$$(`iframe[name="${frame}"]`);
    }

    if (this.getEngine('playwright')) {
      const page = this.page as FramePlaywright;
      elementHandle = await page.$$(`iframe[name="${frame}"]`);
    }

    const frameElem = elementHandle?.length && (await elementHandle[0].contentFrame());

    if (frameElem) {
      this.page = frameElem;
    }
  }

  async runAtom(args?: TestArgsType): Promise<Record<string, unknown>> {
    const startTime = process.hrtime.bigint();

    // Use in atoms
    // this.allData
    // this.allRunners
    // this.browser
    // this.data
    // this.environment
    // this.envsId
    // this.log
    // this.options
    // this.page
    // this.runner
    // this.selectors

    const testArgs = Object.entries(args || {});
    testArgs.forEach((entry) => {
      const [key, value] = entry;
      if (Object.hasOwn(args, key)) {
        this[key] = value;
      }
    });

    const { data, bindData, selectors, bindSelectors, bindResults, options, levelIndent, envsId, stepId, breadcrumbs } =
      args.agent;

    this.log = async (customLog: LogInputType): Promise<void> => {
      const logOptionsDefault: LogOptionsType = {
        screenshot: false,
        fullpage: false,
      };

      if (args) {
        const logOptions = { ...logOptionsDefault, ...(args.logOptions ?? {}), ...(customLog.logOptions ?? {}) };
        const logMeta = { ...{ breadcrumbs: breadcrumbs ?? [] }, ...(customLog.logMeta ?? {}) };
        const logData = {
          level: 'raw' as ColorsType,
          levelIndent: (levelIndent ?? 0) + 1,
          logOptions,
          logMeta,
          ...customLog,
        };
        logData.logOptions.logThis = logData.level === 'error' ? true : logData.logOptions.logThis;
        await args.log(logData);
      }
    };

    try {
      await this.updateFrame(args.agent);
      const result = await this.atomRun();

      await logExtend(this.log, { data, bindData, selectors, bindSelectors, bindResults, options, levelIndent });

      const endTime = process.hrtime.bigint();
      await logTimer(this.log, startTime, endTime, { levelIndent, stepId });
      return result;
    } catch (error) {
      await logError(this.log, error);
      await logExtend(this.log, { data, bindData, selectors, bindSelectors, bindResults, options, levelIndent }, true);
      await logArgs(this.log);
      await logDebug(this.log, { data, selectors });
      await logExtendFileInfo(this.log, { envsId });

      throw new AtomError('Error in Atom');
    }
  }
}
