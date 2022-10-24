import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync, spawn, spawnSync } from 'child_process';

import axios from 'axios';
import { Browser as BrowserPuppeteer } from 'puppeteer';
import { Browser as BrowserPlaywright } from 'playwright';

import { sleep, blankSocket, generateId, initOutputLatest, initOutput } from './Helpers';
import TestsContent from './TestContent';
import { Arguments } from './Arguments';
import Log from './Log';
import {
  BrouserLaunchOptions,
  BrowserFrame,
  BrowserNameType,
  BrowserPageType,
  EnvBrowserType,
  EnvRunnersType,
  EnvStateType,
  EnvType,
  LogEntry,
  SocketType,
  EnvYamlType,
  Outputs,
  OutputsLatest,
} from './global.d';
import Singleton from './Singleton';

type EnvsInstanceType = {
  envRunners: EnvRunnersType;
  socket: SocketType;
  envsId: string;
  logger: Log;
  log: Array<LogEntry>;
  output: Outputs;
};

const BROWSER_DEFAULT: EnvBrowserType = {
  type: 'browser',
  engine: 'playwright',
  runtime: 'run',
  browserName: 'chromium',
  headless: false,
  slowMo: 1,
};

export class EnvRunners implements EnvRunnersType {
  envs: Record<string, EnvState>;
  current: { name?: string; page?: string; test?: string };
  envsId: string;

  constructor(envsId: string) {
    this.envs = {};
    this.current = {};
    this.envsId = envsId;
  }

  getActivePage(): BrowserPageType | BrowserFrame {
    const activeEnv = this.envs[this.current?.name || ''];
    const pageName = this.current?.page || '';
    if (!activeEnv.state.pages) {
      throw new Error('No active page');
    }
    return activeEnv.state.pages[pageName];
  }

  async setEnv({
    name,
    env = {},
    page = '',
  }: {
    name: string;
    env: Record<string, unknown>;
    page: string;
  }): Promise<void> {
    const envResolved: EnvYamlType = { ...{ name: '__blank_env__', type: 'env', browser: BROWSER_DEFAULT }, ...env };

    let localName = name;

    if (name) {
      if (!this.envs[name]) {
        const { envs } = new TestsContent().allData;
        const envFromFile = envs.find((v) => v.name === name);
        if (envFromFile) {
          const envLocal = JSON.parse(JSON.stringify(envFromFile));
          this.envs[name] = new EnvState(envLocal);
          await this.runBrowsers(name);
        } else {
          throw new Error(`Can't init environment '${name}'. Check 'envs' parameter`);
        }
      } else if (!this.envs[name]?.state?.browser) {
        await this.runBrowsers(name);
      }
    } else {
      localName = envResolved.name;
      this.envs[localName] = new EnvState(envResolved);
      await this.runBrowsers(localName);
    }

    this.current.name = localName;
    if (page && this.envs[localName]?.state?.pages?.[page]) {
      this.current.page = page;
    } else if (this.envs[localName]?.state?.pages?.main) {
      this.current.page = 'main';
    }
  }

  async runBrowsers(envName: string): Promise<void> {
    const envPool = this.envs[envName];
    const browserSettings = { ...BROWSER_DEFAULT, ...envPool.env.browser };
    // TODO: 2021-02-22 S.Starodubov resolve executablePath if exec script out of project as standalone app
    const { type, engine, runtime } = browserSettings;

    if (type === 'browser' && runtime === 'run' && engine === 'puppeteer') {
      await this.runPuppeteer(envName);
    }

    if (type === 'browser' && runtime === 'run' && engine === 'playwright') {
      await this.runPlaywright(envName);
    }

    if (type === 'browser' && runtime === 'connect') {
      // TODO: 2020-11-07 S.Starodubov todo
    }

    if (type === 'electron') {
      if (runtime === 'connect') {
        const { browser, pages } = await EnvRunners.connectElectron(browserSettings);
        envPool.state = { ...envPool.state, ...{ browser, pages } };
      }
      if (runtime === 'run') {
        const { browser, pages, pid } = await this.runElectron(browserSettings, envPool.name);
        envPool.state = { ...envPool.state, ...{ browser, pages, pid } };
      }
    }
  }

  async addPage(envName: string, name = 'main', options: { width?: number; height?: number } = {}): Promise<void> {
    const envPool = this.envs[envName];
    const { width = 1024, height = 768 } = options;
    const { browser } = envPool.state;
    const browserSettings = envPool.env.browser;

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

    envPool.state.pages = { ...envPool.state.pages, ...{ [name]: page } };
  }

  async runPuppeteer(envName: string): Promise<void> {
    const { PPD_DEBUG_MODE = false } = new Arguments().args;
    const envPool = this.envs[envName];
    const browserSettings = envPool.env.browser;
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
    envPool.state = { ...envPool.state, ...{ browser, pages } };
  }

  async runPlaywright(envName: string): Promise<void> {
    const { PPD_DEBUG_MODE = false } = new Arguments().args;
    const envPool = this.envs[envName];
    const browserSettings = envPool.env.browser;
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

    envPool.state = { ...envPool.state, ...{ browser } };

    await this.addPage(envName, 'main', { width, height });
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

  static async connectElectron(browserSettings: EnvBrowserType): Promise<EnvStateType> {
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
        const { browser, pages } = await this.connectPuppeteer(webSocketDebuggerUrl, slowMo, windowSize, timeout);
        return { browser, pages };
      }
      if (engine === 'playwright') {
        const { browser, pages } = await this.connectPlaywright(
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

  async runElectron(browserSettings: EnvBrowserType, envName: string): Promise<EnvStateType> {
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

    const { folderLatest, folder } = new Environment().getOutput(this.envsId);

    if (runtimeExecutable && folder && folderLatest) {
      process.env = { ...process.env, ...browserEnv };

      const prc = spawn(runtimeExecutable, runArgs, { cwd, env: process.env });

      if (prc) {
        fs.writeFileSync(path.join(folder, `${envName}.log`), '');
        fs.writeFileSync(path.join(folderLatest, `${envName}.log`), '');

        prc.stdout.on('data', (data) => {
          fs.appendFileSync(path.join(folder, `${envName}.log`), String(data));
          fs.appendFileSync(path.join(folderLatest, `${envName}.log`), String(data));
        });
      }

      let connectionTryes = 0;
      while (connectionTryes < secondsToStartApp) {
        try {
          const { browser, pages } = await EnvRunners.connectElectron(browserSettings);
          await sleep(secondsDelayAfterStartApp * 1000);
          return { browser, pages, pid: prc.pid };
        } catch (error) {
          await sleep(1000);
          connectionTryes += 1;
        }
      }
    }
    throw new Error(`Can't run Electron ${runtimeExecutable}`);
  }

  async closeEnv(name: string): Promise<void> {
    const { state, env } = this.envs[name] || {};
    try {
      await state?.browser?.close();
    } catch (error) {
      // Nothing to do.
    }
    try {
      const killOnEnd = env.browser?.killOnEnd || true;
      const killProcessName = env.browser?.killProcessName;
      if (killOnEnd && killProcessName) {
        const platform = os.platform();

        if (platform.startsWith('win')) {
          spawnSync('taskkill', ['/f', '/im', killProcessName]);
        } else if (platform === 'darwin') {
          execSync(`osascript -e 'quit app "${killProcessName}"'`);
        } else if (platform === 'linux') {
          execSync(`pkill ${killProcessName}`);
        } else {
          console.error(`Quitting a process is not supported on '${platform}' platform.`);
        }
      }
    } catch (error) {
      // Nothing to do.
    }

    delete this.envs[name].state.browser;
    delete this.envs[name].state.browserSettings;
    delete this.envs[name].state.pages;
    delete this.envs[name].state.contexts;
    delete this.envs[name].state.pid;
  }

  async closeAllEnvs(): Promise<void> {
    for (const name of Object.keys(this.envs)) {
      await this.closeEnv(name);
    }
  }

  setCurrentTest(testName = ''): void {
    if (testName) {
      this.current.test = testName;
    }
  }
}

export class EnvState {
  name: string;
  state: EnvStateType; // Browser, pages, cookies, etc.
  env: EnvType;

  constructor(env: EnvType) {
    this.name = env.name;
    this.state = {};
    this.env = env;
  }
}

export class Environment extends Singleton {
  private instances: Record<string, EnvsInstanceType>;

  private output: OutputsLatest;

  constructor(reInit = false) {
    super();
    if (reInit || !this.instances) {
      this.instances = {};
      this.output = initOutputLatest();
    }
  }

  createEnv(
    data: { envsId?: string; socket?: SocketType; loggerOptions?: { stdOut?: boolean } } = {},
  ): EnvsInstanceType {
    const { envsId = generateId(), socket = blankSocket, loggerOptions } = data;

    if (!this.instances[envsId]) {
      const output = initOutput(envsId);
      const envRunners = new EnvRunners(envsId);
      const logger = new Log(envsId, envRunners, loggerOptions);

      this.instances[envsId] = { output, envRunners, socket, envsId, logger, log: [] };
    }
    return this.getEnvAllInstance(envsId);
  }

  private checkId(envsId: string): void {
    if (!envsId || !this.instances[envsId]) {
      throw new Error(`Unknown ENV ID ${envsId}`);
    }
  }

  getEnvRunners(envsId: string): EnvRunnersType {
    this.checkId(envsId);
    return this.instances[envsId].envRunners;
  }

  getEnvAllInstance(envsId: string): EnvsInstanceType {
    this.checkId(envsId);
    return this.instances[envsId];
  }

  getOutput(envsId?: string): OutputsLatest & Outputs {
    if (!envsId) {
      return this.output;
    }
    this.checkId(envsId);
    return { ...this.output, ...this.instances[envsId].output };
  }

  getSocket(envsId: string): SocketType {
    this.checkId(envsId);
    return this.instances[envsId].socket;
  }
}
