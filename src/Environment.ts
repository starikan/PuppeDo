import fs from 'fs';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import crypto from 'crypto';

import fetch from 'node-fetch';
import { Browser as BrowserPuppeteer } from 'puppeteer';
import { Browser as BrowserPlaywright } from 'playwright';

import { sleep, blankSocket, getNowDateTime } from './Helpers';
import TestsContent from './TestContent';
import { Arguments } from './Arguments';
import Env from './Env';
import Log from './Log';
import {
  BrouserLaunchOptions,
  BrowserFrame,
  BrowserNameType,
  BrowserPageType,
  EnvBrowserType,
  EnvsPoolType,
  EnvStateType,
  EnvType,
  LogEntry,
  SocketType,
  EnvYamlType,
} from './global.d';

type EnvsInstanceType = {
  envsPool: EnvsPoolType;
  socket: SocketType;
  envsId: string;
  logger: Log;
};

const BROWSER_DEFAULT: EnvBrowserType = {
  type: 'browser',
  engine: 'playwright',
  runtime: 'run',
  browserName: 'chromium',
  headless: false,
  slowMo: 1,
};

export class EnvsPool implements EnvsPoolType {
  envs: Record<string, { env: EnvType; name: string; state: EnvStateType }>;
  current: { name?: string; page?: string; test?: string };
  log: Array<LogEntry>;
  output: {
    folder?: string;
    folderLatest?: string;
    folderLatestFull?: string;
    output?: string;
    name?: string;
    folderFull?: string;
  };

  constructor() {
    this.envs = {};
    this.current = {};
    this.output = {};
    this.log = [];
  }

  getActivePage(): BrowserPageType | BrowserFrame {
    const activeEnv = this.envs[this.current?.name || ''];
    const pageName = this.current?.page || '';
    if (!activeEnv.state.pages) {
      throw new Error('No active page');
    }
    return activeEnv.state.pages[pageName];
  }

  static resolveOutputFile(): string {
    const outputSourceRaw = path.resolve(path.join('dist', 'output.html'));
    const outputSourceModule = path.resolve(
      path.join(__dirname, '..', 'node_modules', '@puppedo', 'core', 'dist', 'output.html'),
    );
    const outputSource = fs.existsSync(outputSourceRaw) ? outputSourceRaw : outputSourceModule;
    return outputSource;
  }

  initOutput(envsId: string): void {
    const { PPD_OUTPUT: output } = new Arguments().args;

    if (!fs.existsSync(output)) {
      fs.mkdirSync(output);
    }
    const now = getNowDateTime();

    const folder = path.join(output, `${now}_${envsId}`);
    fs.mkdirSync(folder);

    fs.copyFileSync(EnvsPool.resolveOutputFile(), path.join(folder, 'output.html'));

    this.output.output = output;
    this.output.name = envsId;
    this.output.folder = folder;
    this.output.folderFull = path.resolve(folder);

    this.initOutputLatest();
    this.initOutput = (): void => {
      // Do nothing
    };
  }

  initOutputLatest(): void {
    const { PPD_OUTPUT: output } = new Arguments().args;

    const folderLatest = path.join(output, 'latest');

    if (!fs.existsSync(output)) {
      fs.mkdirSync(output);
    }

    // Create latest log path
    if (!fs.existsSync(folderLatest)) {
      fs.mkdirSync(folderLatest);
    } else {
      const filesExists = fs.readdirSync(folderLatest);
      for (let i = 0; i < filesExists.length; i += 1) {
        fs.unlinkSync(path.join(folderLatest, filesExists[i]));
      }
    }

    fs.copyFileSync(EnvsPool.resolveOutputFile(), path.join(folderLatest, 'output.html'));

    this.output.folderLatest = folderLatest;
    this.output.folderLatestFull = path.resolve(folderLatest);

    // Drop this function after first use
    this.initOutputLatest = (): void => {
      // Do nothing
    };
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
          this.envs[name] = new Env(envLocal);
          await this.runBrowsers(name);
        } else {
          throw new Error(`Can't init environment '${name}'. Check 'envs' parameter`);
        }
      } else if (!this.envs[name]?.state?.browser) {
        await this.runBrowsers(name);
      }
    } else {
      localName = envResolved.name;
      this.envs[localName] = new Env(envResolved);
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
        const { browser, pages } = await EnvsPool.connectElectron(browserSettings);
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
    const { width, height } = options;
    const { browser } = envPool.state;
    const browserSettings = envPool.env.browser;

    let page: BrowserPageType;
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
    } = browserSettings || {};
    const { width = 1024, height = 768 } = windowSize;

    const options: BrouserLaunchOptions = { headless, slowMo, args, executablePath };
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
  ): Promise<{ browser: BrowserPuppeteer; pages: Record<string, BrowserPageType> }> {
    const puppeteer = __non_webpack_require__('puppeteer');
    const browser = await puppeteer.connect({
      browserWSEndpoint: webSocketDebuggerUrl,
      ignoreHTTPSErrors: true,
      slowMo,
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
    browserName: BrowserNameType,
  ): Promise<{ browser: BrowserPlaywright; pages: Record<string, BrowserPageType> }> {
    const playwright = __non_webpack_require__('playwright');
    const browser = await playwright[browserName].connect({
      wsEndpoint: webSocketDebuggerUrl,
      slowMo,
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
    const { urlDevtoolsJson, windowSize = {}, slowMo = 0, engine = 'puppeteer', browserName } = browserSettings || {};

    if (urlDevtoolsJson) {
      const jsonPagesResponse = await fetch(`${urlDevtoolsJson}json`, { method: 'GET' });
      const jsonBrowserResponse = await fetch(`${urlDevtoolsJson}json/version`, { method: 'GET' });

      const jsonPages = await jsonPagesResponse.json();
      const jsonBrowser = await jsonBrowserResponse.json();

      if (!jsonBrowser || !jsonPages) {
        throw new Error(`Can't connect to ${urlDevtoolsJson}`);
      }

      const { webSocketDebuggerUrl } = jsonBrowser;
      if (!webSocketDebuggerUrl) {
        throw new Error('webSocketDebuggerUrl empty. Possibly wrong Electron version running');
      }

      if (engine === 'puppeteer') {
        const { browser, pages } = await this.connectPuppeteer(webSocketDebuggerUrl, slowMo, windowSize);
        return { browser, pages };
      }
      if (engine === 'playwright') {
        const { browser, pages } = await this.connectPlaywright(webSocketDebuggerUrl, slowMo, windowSize, browserName);
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
    const { folder, folderLatest } = this.output;

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
          const { browser, pages } = await EnvsPool.connectElectron(browserSettings);
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
        spawnSync('taskkill', ['/f', '/im', killProcessName]);
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
    for (let i = 0; i < Object.keys(this.envs).length; i += 1) {
      const name = Object.keys(this.envs)[i];
      await this.closeEnv(name);
    }
  }

  setCurrentTest(testName = ''): void {
    if (testName) {
      this.current.test = testName;
    }
  }
}

const instances: Record<string, EnvsInstanceType> = {};

export default (envsId = '', socket: SocketType = blankSocket): EnvsInstanceType => {
  let envsIdLocal = envsId;
  if (envsIdLocal) {
    if (!instances[envsIdLocal]) {
      throw new Error(`Unknown ENV ID ${envsIdLocal}`);
    }
  } else {
    envsIdLocal = crypto.randomBytes(6).toString('hex');
    const newEnvs = new EnvsPool();
    const logger = new Log(envsIdLocal, newEnvs, socket);
    instances[envsIdLocal] = { envsPool: newEnvs, socket, envsId: envsIdLocal, logger };
  }

  instances[envsIdLocal].envsPool.initOutput(envsIdLocal);

  return instances[envsIdLocal];
};
