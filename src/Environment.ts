import os from 'os';
import { execSync, spawnSync } from 'child_process';

import { blankSocket, generateId, initOutputLatest, initOutput } from './Helpers';
import TestsContent from './TestContent';
import Log from './Log';
import {
  BrowserFrame,
  BrowserPageType,
  EnvBrowserType,
  EnvRunnersType,
  RunnerStateType,
  RunnerType,
  LogEntry,
  SocketType,
  RunnerYamlType,
  Outputs,
  OutputsLatest,
  RunnerClassType,
  RunnerCurrentType,
} from './global.d';
import Singleton from './Singleton';
import { Engines } from './Engines';

type EnvsInstanceType = {
  envRunners: EnvRunnersType;
  socket: SocketType;
  envsId: string;
  logger: Log;
  log: Array<LogEntry>;
  output: Outputs;
  current: RunnerCurrentType;
};

const BROWSER_DEFAULT: EnvBrowserType = {
  type: 'browser',
  engine: 'playwright',
  runtime: 'run',
  browserName: 'chromium',
  headless: false,
  slowMo: 1,
};

class EnvRunners implements EnvRunnersType {
  runners: Record<string, Runner>;
  envsId: string;

  constructor(envsId: string) {
    this.runners = {};
    this.envsId = envsId;
  }

  async setEnv({
    name,
    env = {},
    page = '',
  }: {
    name: string;
    env: Partial<RunnerYamlType>;
    page: string;
  }): Promise<void> {
    const envResolved: RunnerYamlType = { ...{ name: '__blank_env__', type: 'env', browser: BROWSER_DEFAULT }, ...env };

    let localName = name;

    if (name) {
      if (!this.runners[name]) {
        const { envs } = new TestsContent().allData;
        const envFromFile = envs.find((v) => v.name === name);
        if (envFromFile) {
          const envLocal = JSON.parse(JSON.stringify(envFromFile));
          this.runners[name] = new Runner(this.envsId, envLocal);
          await this.runners[name].runEngine();
        } else {
          throw new Error(`Can't init environment '${name}'. Check 'envs' parameter`);
        }
      } else if (!this.runners[name]?.state?.browser) {
        await this.runners[name].runEngine();
      }
    } else {
      localName = envResolved.name;
      this.runners[localName] = new Runner(this.envsId, envResolved);
      await this.runners[localName].runEngine();
    }

    const newCurrent: RunnerCurrentType = {};
    newCurrent.name = localName;
    if (page && this.runners[localName]?.state?.pages?.[page]) {
      newCurrent.page = page;
    } else if (this.runners[localName]?.state?.pages?.main) {
      newCurrent.page = 'main';
    }

    new Environment().setCurrent(this.envsId, newCurrent);
  }

  async closeEnv(name: string): Promise<void> {
    await this.runners[name].stopEngine();

    delete this.runners[name].state.browser;
    delete this.runners[name].state.browserSettings;
    delete this.runners[name].state.pages;
    delete this.runners[name].state.contexts;
    delete this.runners[name].state.pid;
  }

  async closeAllEnvs(): Promise<void> {
    for (const name of Object.keys(this.runners)) {
      await this.closeEnv(name);
    }
  }

  getActivePage(): BrowserPageType | BrowserFrame {
    const current = new Environment().getCurrent(this.envsId);
    const { name = '', page = '' } = current;
    const activeEnv = this.runners[name];
    if (!activeEnv.state.pages) {
      throw new Error('No active page');
    }
    return activeEnv.state.pages[page];
  }
}

export class Runner implements RunnerClassType {
  name: string;
  state: RunnerStateType; // Browser, pages, cookies, etc.
  runnerData: RunnerType;
  envsId: string;

  constructor(envsId: string, runnerData: RunnerType) {
    this.name = runnerData.name;
    this.state = {};
    this.runnerData = runnerData;
    this.envsId = envsId;
  }

  async runEngine(): Promise<void> {
    const browserSettings = { ...BROWSER_DEFAULT, ...this.runnerData.browser };
    // TODO: 2021-02-22 S.Starodubov resolve executablePath if exec script out of project as standalone app
    const { type, engine, runtime } = browserSettings;

    if (type === 'browser' && runtime === 'run' && engine === 'puppeteer') {
      const newState = await Engines.runPuppeteer(this.runnerData, this.state);
      this.state = { ...this.state, ...newState };
    }

    if (type === 'browser' && runtime === 'run' && engine === 'playwright') {
      const newState = await Engines.runPlaywright(this.runnerData, this.state);
      this.state = { ...this.state, ...newState };
    }

    if (type === 'browser' && runtime === 'connect') {
      // TODO: 2020-11-07 S.Starodubov todo
    }

    if (type === 'electron') {
      if (runtime === 'connect') {
        const { browser, pages } = await Engines.connectElectron(browserSettings);
        this.state = { ...this.state, ...{ browser, pages } };
      }
      if (runtime === 'run') {
        const { browser, pages, pid } = await Engines.runElectron(browserSettings, this.name, this.envsId);
        this.state = { ...this.state, ...{ browser, pages, pid } };
      }
    }
  }

  async stopEngine(): Promise<void> {
    try {
      await this.state?.browser?.close();
    } catch (error) {
      // Nothing to do.
    }
    try {
      const killOnEnd = this.runnerData.browser?.killOnEnd || true;
      const killProcessName = this.runnerData.browser?.killProcessName;
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
      const current: RunnerCurrentType = {};

      this.instances[envsId] = { output, envRunners, socket, envsId, logger, current, log: [] };
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

  getCurrent(envsId: string): Partial<RunnerCurrentType> {
    this.checkId(envsId);
    return this.instances[envsId].current;
  }

  setCurrent(envsId: string, newData: Partial<RunnerCurrentType>): void {
    this.checkId(envsId);
    this.instances[envsId].current = { ...this.instances[envsId].current, ...newData };
  }
}
