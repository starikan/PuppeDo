import { spawn } from 'child_process';

import { Browser as BrowserPuppeteer } from 'puppeteer';
import { Browser as BrowserPlaywright } from 'playwright';
import axios from 'axios';

import { Arguments } from './Arguments';
import {
  BrouserLaunchOptions,
  BrowserEngineType,
  BrowserNameType,
  BrowserPageType,
  BrowserTypeType,
  EnvBrowserType,
  RunnerStateType,
  RunnerType,
} from './global.d';
import { sleep } from './Helpers';
import { Environment } from './Environment';

export const DEFAULT_BROWSER: EnvBrowserType = {
  type: 'browser',
  engine: 'playwright',
  runtime: 'run',
  browserName: 'chromium',
  headless: false,
  slowMo: 1,
};
export class Engines {
  static resolveBrowser(browserInput: EnvBrowserType): EnvBrowserType {
    const ALLOW_BROWSER_TYPES: BrowserTypeType[] = ['browser', 'electron'];
    const ALLOW_BROWSER_EGINES: BrowserEngineType[] = ['puppeteer', 'playwright'];
    const ALLOW_BROWSER_MANES: BrowserNameType[] = ['chrome', 'chromium', 'firefox', 'webkit'];

    const browser = { ...DEFAULT_BROWSER, ...(browserInput || {}) };

    if (!ALLOW_BROWSER_TYPES.includes(browser.type)) {
      throw new Error(
        `PuppeDo can't find this type of envitonment: "${browser.type}". Allow this types: ${ALLOW_BROWSER_TYPES}`,
      );
    }

    if (!ALLOW_BROWSER_EGINES.includes(browser.engine) && (browser.type === 'browser' || browser.type === 'electron')) {
      throw new Error(`PuppeDo can't find engine: "${browser.engine}". Allow this engines: ${ALLOW_BROWSER_EGINES}`);
    }

    if (!ALLOW_BROWSER_MANES.includes(browser.browserName)) {
      throw new Error(
        `PuppeDo can't find this type of browser: "${browser.browserName}". Allow this types: ${ALLOW_BROWSER_MANES}`,
      );
    }

    if (
      browser.type === 'browser' &&
      browser.engine === 'playwright' &&
      !['chromium', 'firefox', 'webkit'].includes(browser.browserName)
    ) {
      throw new Error("Playwright supports only browsers: 'chromium', 'firefox', 'webkit'");
    }

    if (
      browser.type === 'browser' &&
      browser.engine === 'puppeteer' &&
      !['chrome', 'firefox'].includes(browser.browserName)
    ) {
      throw new Error("Puppeteer supports only browsers: 'chrome', 'firefox'");
    }

    if (!['run', 'connect'].includes(browser.runtime)) {
      throw new Error('PuppeDo can run or connect to browser only');
    }

    if (browser.runtime === 'connect' && browser.type === 'browser') {
      throw new Error("PuppeDo can't connect to browser yet");
    }

    return browser;
  }

  static async runPlaywright(runnerData: RunnerType, state: RunnerStateType): Promise<RunnerStateType> {
    const { PPD_DEBUG_MODE = false } = new Arguments().args;
    const browserSettings = runnerData.browser;
    const {
      headless = true,
      slowMo = 0,
      args = [],
      browserName = 'chromium',
      windowSize = {},
      executablePath = '',
      timeout = 30000,
    } = browserSettings || {};
    const { width = 1024, height = 768 } = windowSize;

    const options: BrouserLaunchOptions = { headless, slowMo, args, executablePath, timeout };
    if (browserName === 'chromium') {
      options.devtools = PPD_DEBUG_MODE;
    }

    const playwright = __non_webpack_require__('playwright');
    const browser = await playwright[browserName].launch(options);

    const newState = { ...state, ...{ browser } };

    const addedPageState = await Engines.addPage(newState, runnerData, { width, height });

    return { ...newState, ...addedPageState };
  }

  static async connectPlaywright(
    webSocketDebuggerUrl: string,
    slowMo: number,
    windowSize: { width?: number; height?: number },
    timeout: number,
    browserName: BrowserNameType,
  ): Promise<{ browser: BrowserPlaywright; pages: Record<string, BrowserPageType> }> {
    const playwright = __non_webpack_require__('playwright');
    const browser = await playwright[browserName].connect({
      wsEndpoint: webSocketDebuggerUrl,
      slowMo,
      timeout,
    });
    const contexts = await browser.contexts({ ignoreHTTPSErrors: true });
    const pagesRaw = await contexts.pages();

    if (!pagesRaw.length) {
      throw new Error('Can`t find any pages in connection');
    }
    const pages = { main: pagesRaw[0] };

    const { width, height } = windowSize;
    if (width && height) {
      await pages.main.setViewportSize({ width, height });
    }
    return { browser, pages };
  }

  static async runElectron(browserSettings: EnvBrowserType, envName: string, envsId: string): Promise<RunnerStateType> {
    const { runtimeEnv = {} } = browserSettings;
    const {
      runtimeExecutable,
      program = '',
      cwd = '',
      args: browserArgs = [],
      env: browserEnv = {},
      secondsToStartApp = 30,
      secondsDelayAfterStartApp = 0,
    } = runtimeEnv;

    const runArgs = [program, ...browserArgs];

    if (runtimeExecutable) {
      process.env = { ...process.env, ...browserEnv };

      const prc = spawn(runtimeExecutable, runArgs, { cwd, env: process.env, shell: true });

      if (prc) {
        new Environment().getLogger(envsId).exporter.saveToFile(`${envName}.log`, '');

        prc.stdout.on('data', (data) => {
          new Environment().getLogger(envsId).exporter.appendToFile(`${envName}.log`, String(data));
        });
      }

      let connectionTryes = 0;
      while (connectionTryes < secondsToStartApp) {
        try {
          const { browser, pages } = await Engines.connectElectron(browserSettings);
          await sleep(secondsDelayAfterStartApp * 1000);
          return { browser, pages, pid: prc.pid };
        } catch {
          await sleep(1000);
          connectionTryes += 1;
        }
      }
    }
    throw new Error(`Can't run Electron ${runtimeExecutable}`);
  }

  static async connectElectron(browserSettings: EnvBrowserType): Promise<RunnerStateType> {
    const {
      urlDevtoolsJson,
      windowSize = {},
      slowMo = 0,
      engine = 'puppeteer',
      browserName,
      timeout = 30000,
    } = browserSettings || {};

    if (urlDevtoolsJson) {
      const jsonPagesResponse = await axios(`${urlDevtoolsJson}json`, { method: 'GET' });
      const jsonBrowserResponse = await axios(`${urlDevtoolsJson}json/version`, {
        method: 'GET',
      });

      const jsonPages = await jsonPagesResponse.data;
      const jsonBrowser = (await jsonBrowserResponse.data) as { webSocketDebuggerUrl: string };

      if (!jsonBrowser || !jsonPages) {
        throw new Error(`Can't connect to ${urlDevtoolsJson}`);
      }

      const { webSocketDebuggerUrl } = jsonBrowser;
      if (!webSocketDebuggerUrl) {
        throw new Error('webSocketDebuggerUrl empty. Possibly wrong Electron version running');
      }

      if (engine === 'puppeteer') {
        const { browser, pages } = await Engines.connectPuppeteer(webSocketDebuggerUrl, slowMo, windowSize, timeout);
        return { browser, pages };
      }
      if (engine === 'playwright') {
        const { browser, pages } = await Engines.connectPlaywright(
          webSocketDebuggerUrl,
          slowMo,
          windowSize,
          timeout,
          browserName,
        );
        return { browser, pages };
      }
      throw new Error('Can`t find any supported browser engine in environment');
    }

    throw new Error(`Can't connect to Electron ${urlDevtoolsJson}`);
  }

  static async runPuppeteer(runnerData: RunnerType, state: RunnerStateType): Promise<RunnerStateType> {
    const { PPD_DEBUG_MODE = false } = new Arguments().args;
    const browserSettings = runnerData.browser;
    const {
      headless = true,
      slowMo = 0,
      args = [],
      windowSize = {},
      browserName: product = 'chrome',
      executablePath = '',
      timeout = 30000,
    } = browserSettings;
    const { width = 1024, height = 768 } = windowSize;

    const puppeteer = __non_webpack_require__('puppeteer');
    const browser: BrowserPuppeteer = await puppeteer.launch({
      headless,
      slowMo,
      args,
      devtools: PPD_DEBUG_MODE,
      product,
      ignoreHTTPSErrors: true,
      defaultViewport: { width, height },
      executablePath,
      timeout,
    });

    const pagesExists = await browser.pages();

    const pages = { main: pagesExists[0] };
    const newState = { ...state, ...{ browser, pages } };

    return newState;
  }

  static async connectPuppeteer(
    webSocketDebuggerUrl: string,
    slowMo: number,
    windowSize: { width?: number; height?: number },
    timeout: number,
  ): Promise<{ browser: BrowserPuppeteer; pages: Record<string, BrowserPageType> }> {
    const puppeteer = __non_webpack_require__('puppeteer');
    const browser = await puppeteer.connect({
      browserWSEndpoint: webSocketDebuggerUrl,
      ignoreHTTPSErrors: true,
      slowMo,
      timeout,
    });

    const pagesRaw = await browser.pages();

    if (!pagesRaw.length) {
      throw new Error('Can`t find any pages in connection');
    }
    const pages = { main: pagesRaw[0] };

    const { width, height } = windowSize;
    if (width && height) {
      await pages.main.setViewport({ width, height });
    }
    return { browser, pages };
  }

  static async addPage(
    state: RunnerStateType,
    runnerData: RunnerType,
    options: { width?: number; height?: number } = {},
    name = 'main',
  ): Promise<RunnerStateType> {
    const { width = 1024, height = 768 } = options;
    const { browser } = state;
    const browserSettings = runnerData.browser;

    let page: BrowserPageType | null = null;
    if (browserSettings.engine === 'puppeteer') {
      page = await (browser as BrowserPuppeteer).newPage();
      if (width && height) {
        await page.setViewport({ width, height });
      }
    }

    if (browserSettings.engine === 'playwright') {
      page = await (browser as BrowserPlaywright).newPage({ viewport: { width, height }, ignoreHTTPSErrors: true });
      // if (width && height) {
      //   await page.setViewportSize({ width, height });
      // }
    }

    if (!page) {
      throw new Error('Cant add new page');
    }

    const newState = { ...state };
    newState.pages = { ...newState.pages, ...{ [name]: page } };
    return newState;
  }
}
