import os from 'os';
import { execSync, spawnSync } from 'child_process';

import { blankSocket, generateId, initOutputLatest, initOutput } from './Helpers';
import TestsContent from './TestContent';
import Log from './Log';
import {
  BrowserFrame,
  BrowserPageType,
  EnvBrowserType,
  RunnerStateType,
  RunnerType,
  LogEntry,
  SocketType,
  RunnerYamlType,
  Outputs,
  OutputsLatest,
  RunnerCurrentType,
} from './global.d';
import Singleton from './Singleton';
import { Engines } from './Engines';

type EnvsInstanceType = {
  runners: Runners;
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

export class Runners {
  private runners: Record<string, Runner>;

  private envsId: string;

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
          this.runners[name] = new Runner(envLocal);
          await this.runners[name].runEngine(this.envsId);
        } else {
          throw new Error(`Can't init environment '${name}'. Check 'envs' parameter`);
        }
      } else if (!this.runners[name]?.getState().browser) {
        await this.runners[name].runEngine(this.envsId);
      }
    } else {
      localName = envResolved.name;
      this.runners[localName] = new Runner(envResolved);
      await this.runners[localName].runEngine(this.envsId);
    }

    const newCurrent: RunnerCurrentType = {};
    newCurrent.name = localName;
    if (page && this.runners[localName]?.getState().pages?.[page]) {
      newCurrent.page = page;
    } else if (this.runners[localName]?.getState().pages?.main) {
      newCurrent.page = 'main';
    }

    new Environment().setCurrent(this.envsId, newCurrent);
  }

  async closeEnv(name: string): Promise<void> {
    await this.runners[name].stopEngine();
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
    if (!activeEnv.getState().pages) {
      throw new Error('No active page');
    }
    return activeEnv.getState().pages?.[page];
  }

  getRunnerByName(name: string): Runner {
    return this.runners[name];
  }
}

export class Runner {
  private name: string;

  private state: RunnerStateType; // Browser, pages, cookies, etc.

  private runnerData: RunnerType;

  constructor(runnerData: RunnerType) {
    this.name = runnerData.name;
    this.state = {};
    this.runnerData = runnerData;
  }

  getRunnerData(): RunnerType {
    return this.runnerData;
  }

  getState(): RunnerStateType {
    return this.state;
  }

  async runEngine(envsId): Promise<void> {
    const browserSettings = { ...BROWSER_DEFAULT, ...this.runnerData.browser };
    const outputs = new Environment().getOutput(envsId);
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
        const { browser, pages, pid } = await Engines.runElectron(browserSettings, this.name, outputs);
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

    delete this.state.browser;
    delete this.state.browserSettings;
    delete this.state.pages;
    delete this.state.contexts;
    delete this.state.pid;
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
      const runners = new Runners(envsId);
      const logger = new Log(envsId, runners, loggerOptions);
      const current: RunnerCurrentType = {};

      this.instances[envsId] = { output, runners, socket, envsId, logger, current, log: [] };
    }
    return this.getEnvAllInstance(envsId);
  }

  private checkId(envsId: string): void {
    if (!envsId || !this.instances[envsId]) {
      throw new Error(`Unknown ENV ID ${envsId}`);
    }
  }

  getEnvRunners(envsId: string): Runners {
    this.checkId(envsId);
    return this.instances[envsId].runners;
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
