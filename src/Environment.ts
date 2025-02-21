import os from 'os';
import { execSync, spawnSync } from 'child_process';
import { blankSocket, generateId } from './Helpers';
import AgentContent from './TestContent';
import { Log, LogOptions } from './Log';
import {
  BrowserFrame,
  BrowserPageType,
  RunnerStateType,
  RunnerType,
  LogEntry,
  SocketType,
  RunnerYamlType,
  Outputs,
  RunnerCurrentType,
  LogPipe,
  TestExtendType,
} from './global.d';
import Singleton from './Singleton';
import { DEFAULT_BROWSER, Engines } from './Engines';
import TestStructure from './TestStructure';
import { TestTree } from './TestTree';

type EnvsInstanceType = {
  allRunners: Runners;
  socket: SocketType;
  envsId: string;
  logger: Log;
  log: Array<LogEntry>;
  current: RunnerCurrentType;
  testsStruct: Record<string, TestExtendType>;
  testTree: TestTree;
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
      ...{ name: '__blank_runner__', type: 'runner', browser: DEFAULT_BROWSER },
      ...runner,
    };

    let localName = name;

    if (name) {
      if (!this.runners[name]) {
        const { runners } = new AgentContent().allData;
        const runnerFromFile = runners.find((v) => v.name === name);
        if (runnerFromFile) {
          this.runners[name] = new Runner(JSON.parse(JSON.stringify(runnerFromFile)));
          await this.runners[name].runEngine(this.envsId);
        } else {
          throw new Error(`Can't init runner '${name}'. Check 'runner' parameter`);
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
    if (!activeEnv.getState()?.pages?.[page]) {
      throw new Error('No active page');
    }
    return activeEnv.getState().pages[page];
  }

  getRunnerByName(name: string): Runner {
    return this.runners[name];
  }
}

export class Runner {
  private name!: string;

  private state!: RunnerStateType; // Browser, pages, cookies, etc.

  private runnerData!: RunnerType;

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

  async runEngine(envsId: string): Promise<void> {
    const browserSettings = Engines.resolveBrowser({ ...DEFAULT_BROWSER, ...this.runnerData.browser });
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
        const { browser, pages, pid } = await Engines.runElectron(browserSettings, this.name, envsId);
        newState = { browser, pages, pid };
      }
    }

    this.state = { ...this.state, ...newState };
  }

  async stopEngine(): Promise<void> {
    try {
      await this.state?.browser?.close();
    } catch {
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
    } catch {
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
  private instances!: Record<string, EnvsInstanceType>;

  constructor(reInit = false) {
    super();
    if (reInit || !this.instances) {
      this.instances = {};
    }
  }

  createEnv(
    data: { envsId?: string; socket?: SocketType; loggerOptions?: { stdOut?: boolean; loggerPipes?: LogPipe[] } } = {},
  ): EnvsInstanceType {
    const { envsId = generateId(), socket = blankSocket, loggerOptions } = data;

    if (!this.instances[envsId]) {
      // eslint-disable-next-line no-new
      new LogOptions(loggerOptions);
      const logger = new Log(envsId);

      const allRunners = new Runners(envsId);

      const current: RunnerCurrentType = {};

      this.instances[envsId] = {
        allRunners,
        socket,
        envsId,
        logger,
        current,
        // TODO: 2023-03-22 S.Starodubov move this log info into testTree
        log: [],
        testsStruct: {},
        testTree: new TestTree(),
      };
    }
    return this.getEnvInstance(envsId);
  }

  private checkId(envsId: string): void {
    if (!envsId || !this.instances[envsId]) {
      throw new Error(`Unknown ENV ID ${envsId}`);
    }
  }

  /**
   * It returns the full structure of a agent.
   * @param {string} envsId - The id of the environment instance.
   * @param {string} name - The name of the agent.
   * @returns The fullStruct is being returned.
   */
  getStruct(envsId: string, name: string): TestExtendType {
    const existsStruct = this.getEnvInstance(envsId).testsStruct[name];
    if (existsStruct) {
      return existsStruct;
    }

    const fullStruct = TestStructure.getFullDepthJSON(name);
    this.instances[envsId].testsStruct[name] = fullStruct;

    return fullStruct;
  }

  getEnvRunners(envsId: string): Runners {
    this.checkId(envsId);
    return this.instances[envsId].allRunners;
  }

  getEnvInstance(envsId: string): EnvsInstanceType {
    this.checkId(envsId);
    return this.instances[envsId];
  }

  getLogger(envsId: string): Log {
    this.checkId(envsId);
    return this.instances[envsId].logger;
  }

  getOutput(envsId: string): Outputs {
    return this.getLogger(envsId).output;
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
