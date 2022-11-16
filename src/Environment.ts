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
  LogPipe,
} from './global.d';
import Singleton from './Singleton';
import { Engines } from './Engines';

type EnvsInstanceType = {
  allRunners: Runners;
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

  async switchRunner({
    name,
    runner = {},
    page = '',
  }: {
    name: string;
    runner: Partial<RunnerYamlType>;
    page: string;
  }): Promise<void> {
    const runnerResolved: RunnerYamlType = {
      ...{ name: '__blank_runner__', type: 'runner', browser: BROWSER_DEFAULT },
      ...runner,
    };

    let localName = name;

    if (name) {
      if (!this.runners[name]) {
        const { runners } = new TestsContent().allData;
        const runnerFromFile = runners.find((v) => v.name === name);
        if (runnerFromFile) {
          this.runners[name] = new Runner(JSON.parse(JSON.stringify(runnerFromFile)));
          await this.runners[name].runEngine(this.envsId);
        } else {
          throw new Error(`Can't init runner '${name}'. Check 'envs' parameter`);
        }
      } else if (!this.runners[name]?.getState().browser) {
        await this.runners[name].runEngine(this.envsId);
      }
    } else {
      localName = runnerResolved.name;
      this.runners[localName] = new Runner(runnerResolved);
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

  async closeRunner(name: string): Promise<void> {
    await this.runners[name].stopEngine();
  }

  async closeAllRunners(): Promise<void> {
    for (const name of Object.keys(this.runners)) {
      await this.closeRunner(name);
    }
  }

  getActivePage(): BrowserPageType | BrowserFrame {
    const { name = '', page = '' } = new Environment().getCurrent(this.envsId);
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

    let newState = {};

    if (type === 'browser' && runtime === 'run') {
      if (engine === 'puppeteer') {
        newState = await Engines.runPuppeteer(this.runnerData, this.state);
      }

      if (engine === 'playwright') {
        newState = await Engines.runPlaywright(this.runnerData, this.state);
      }
    }

    if (type === 'browser' && runtime === 'connect') {
      // TODO: 2020-11-07 S.Starodubov todo
    }

    if (type === 'electron') {
      if (runtime === 'connect') {
        const { browser, pages } = await Engines.connectElectron(browserSettings);
        newState = { browser, pages };
      }
      if (runtime === 'run') {
        const { browser, pages, pid } = await Engines.runElectron(browserSettings, this.name, outputs);
        newState = { browser, pages, pid };
      }
    }

    this.state = { ...this.state, ...newState };
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
    data: { envsId?: string; socket?: SocketType; loggerOptions?: { stdOut?: boolean; loggerPipes?: LogPipe[] } } = {},
  ): EnvsInstanceType {
    const { envsId = generateId(), socket = blankSocket, loggerOptions } = data;

    if (!this.instances[envsId]) {
      const output = initOutput(envsId);
      const allRunners = new Runners(envsId);
      const logger = new Log(envsId, loggerOptions);

      for (const loggerPipe of loggerOptions?.loggerPipes ?? []) {
        logger.addLogPipe(loggerPipe);
      }

      const current: RunnerCurrentType = {};

      this.instances[envsId] = { output, allRunners, socket, envsId, logger, current, log: [] };
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
    return this.instances[envsId].allRunners;
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
