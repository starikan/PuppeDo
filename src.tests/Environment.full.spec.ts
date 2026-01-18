import { execSync, spawnSync } from 'child_process';
import os from 'os';
import { Environment, Runner, Runners } from '../src/Environment';
import { Engines } from '../src/Engines';
import FlowStructure from '../src/FlowStructure';
import AgentContent from '../src/TestContent';

jest.mock('../src/Engines', () => ({
  DEFAULT_BROWSER: { type: 'browser', engine: 'puppeteer', runtime: 'run', browserName: 'chrome' },
  Engines: {
    resolveBrowser: jest.fn((b) => b),
    runPuppeteer: jest.fn().mockResolvedValue({ browser: { id: 'bp' }, pages: { main: { id: 'p1' } } }),
    runPlaywright: jest.fn().mockResolvedValue({ browser: { id: 'bw' }, pages: { main: { id: 'p2' } } }),
    connectElectron: jest.fn().mockResolvedValue({ browser: { id: 'be' }, pages: { main: { id: 'p3' } } }),
    runElectron: jest.fn().mockResolvedValue({ browser: { id: 'be' }, pages: { main: { id: 'p4' } }, pid: 1 }),
  },
}));

jest.mock('../src/Log', () => ({
  LogOptions: jest.fn(),
  Log: jest.fn().mockImplementation(() => ({ output: { name: 'env', folder: 'f', folderLatest: 'l' }, exporter: {} })),
}));

jest.mock('../src/PluginsCore', () => ({
  Plugins: jest.fn().mockImplementation(() => ({ hook: jest.fn(), getPlugins: jest.fn() })),
}));

jest.mock('../src/AgentTree', () => ({
  AgentTree: jest.fn().mockImplementation(() => ({ updateStep: jest.fn(), findParent: jest.fn(), findNode: jest.fn() })),
}));

jest.mock('../src/TestContent');

jest.mock('../src/FlowStructure');

jest.mock('os');
jest.mock('child_process', () => ({ execSync: jest.fn(), spawnSync: jest.fn() }));

const mockFlowStructure = FlowStructure as jest.Mocked<typeof FlowStructure>;
const mockAgentContent = AgentContent as jest.MockedClass<typeof AgentContent>;
const mockOs = os as jest.Mocked<typeof os>;
const mockSpawnSync = spawnSync as jest.MockedFunction<typeof spawnSync>;
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('Environment (full)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAgentContent.mockImplementation(() => ({ allData: { runners: [] } } as any));
    mockFlowStructure.getFlowFullJSON = jest.fn().mockReturnValue({ name: 'test', stepId: 's1' } as any);
    mockOs.platform.mockReturnValue('win32' as any);
  });

  test('createEnv and getters work', () => {
    const env = new Environment(true);
    const created = env.createEnv({ envsId: 'env-1' });

    expect(created.envsId).toBe('env-1');
    expect(env.getEnvInstance('env-1')).toBeDefined();
    expect(env.getEnvRunners('env-1')).toBeDefined();
    expect(env.getLogger('env-1')).toBeDefined();
    expect(env.getOutput('env-1')).toBeDefined();
    expect(env.getSocket('env-1')).toBeDefined();
    expect(env.getCurrent('env-1')).toEqual({});

    env.setCurrent('env-1', { name: 'runner-1' });
    expect(env.getCurrent('env-1')).toEqual({ name: 'runner-1' });
  });

  test('createEnv returns existing instance without reinit', () => {
    const env = new Environment(true);
    const first = env.createEnv({ envsId: 'env-1' });
    const second = env.createEnv({ envsId: 'env-1' });
    expect(second).toBe(first);
  });

  test('getEnvInstance throws for unknown id', () => {
    const env = new Environment(true);
    expect(() => env.getEnvInstance('missing')).toThrow('Unknown ENV ID missing');
  });

  test('getStruct caches values', () => {
    const env = new Environment(true);
    env.createEnv({ envsId: 'env-1' });

    const first = env.getStruct('env-1', 'test');
    const second = env.getStruct('env-1', 'test');

    expect(first).toBe(second);
    expect(mockFlowStructure.getFlowFullJSON).toHaveBeenCalledTimes(1);
  });

  test('Runners switchRunner with existing runner', async () => {
    mockAgentContent.mockImplementation(
      () =>
        ({
          allData: {
            runners: [{ name: 'r1', type: 'runner', browser: { engine: 'puppeteer' } }],
          },
        } as any),
    );

    const env = new Environment(true);
    env.createEnv({ envsId: 'env-1' });
    const runners = env.getEnvRunners('env-1');

    await runners.switchRunner({ name: 'r1', runner: {}, page: '' });

    expect((Engines as any).runPuppeteer).toHaveBeenCalled();
    expect(env.getCurrent('env-1').name).toBe('r1');
  });

  test('Runners switchRunner uses default runner/page values', async () => {
    const env = new Environment(true);
    env.createEnv({ envsId: 'env-1' });
    const runners = env.getEnvRunners('env-1');

    await runners.switchRunner({ name: '', runner: {} as any, page: '' });

    expect(env.getCurrent('env-1').name).toBe('__blank_runner__');
  });

  test('Runners switchRunner uses default params when omitted', async () => {
    const env = new Environment(true);
    env.createEnv({ envsId: 'env-1' });
    const runners = env.getEnvRunners('env-1');

    await runners.switchRunner({ name: '' } as any);

    expect(env.getCurrent('env-1').name).toBe('__blank_runner__');
  });

  test('Runners switchRunner with inline runner', async () => {
    const env = new Environment(true);
    env.createEnv({ envsId: 'env-1' });
    const runners = env.getEnvRunners('env-1');

    await runners.switchRunner({ name: '', runner: { name: 'inline', browser: { engine: 'playwright' } } as any, page: '' });

    expect((Engines as any).runPlaywright).toHaveBeenCalled();
    expect(env.getCurrent('env-1').name).toBe('inline');
  });

  test('Runners switchRunner runs engine when browser missing', async () => {
    const env = new Environment(true);
    env.createEnv({ envsId: 'env-1' });
    const runners = env.getEnvRunners('env-1');

    (runners as any).runners = {
      r1: {
        getState: jest.fn().mockReturnValue({}),
        runEngine: jest.fn().mockResolvedValue(undefined),
      },
    };

    await runners.switchRunner({ name: 'r1', runner: {}, page: '' });

    expect((runners as any).runners.r1.runEngine).toHaveBeenCalled();
    expect(env.getCurrent('env-1').name).toBe('r1');
  });

  test('Runners switchRunner sets current page from input', async () => {
    const env = new Environment(true);
    env.createEnv({ envsId: 'env-1' });
    const runners = env.getEnvRunners('env-1');

    (runners as any).runners = {
      r1: {
        getState: jest.fn().mockReturnValue({ pages: { custom: { id: 1 }, main: { id: 2 } }, browser: {} }),
        runEngine: jest.fn().mockResolvedValue(undefined),
      },
    };

    await runners.switchRunner({ name: 'r1', runner: {}, page: 'custom' });

    expect(env.getCurrent('env-1').page).toBe('custom');
  });

  test('Runners switchRunner keeps page empty when missing', async () => {
    const env = new Environment(true);
    env.createEnv({ envsId: 'env-1' });
    const runners = env.getEnvRunners('env-1');

    (runners as any).runners = {
      r1: {
        getState: jest.fn().mockReturnValue({ pages: {}, browser: {} }),
        runEngine: jest.fn().mockResolvedValue(undefined),
      },
    };

    await runners.switchRunner({ name: 'r1', runner: {}, page: 'missing' });

    expect(env.getCurrent('env-1').page).toBeUndefined();
  });

  test('Runners switchRunner throws when runner missing', async () => {
    const env = new Environment(true);
    env.createEnv({ envsId: 'env-1' });
    const runners = env.getEnvRunners('env-1');

    await expect(runners.switchRunner({ name: 'missing', runner: {}, page: '' })).rejects.toThrow(
      "Can't init runner 'missing'. Check 'runner' parameter",
    );
  });

  test('Runners getActivePage throws when no active page', () => {
    const env = new Environment(true);
    env.createEnv({ envsId: 'env-1' });
    const runners = env.getEnvRunners('env-1');

    (runners as any).runners = {
      r1: {
        getState: jest.fn().mockReturnValue({ pages: {} }),
      },
    };
    env.setCurrent('env-1', { name: 'r1', page: 'main' });

    expect(() => runners.getActivePage()).toThrow('No active page');
  });

  test('Runners getActivePage returns active page', () => {
    const env = new Environment(true);
    env.createEnv({ envsId: 'env-1' });
    const runners = env.getEnvRunners('env-1');

    const page = { id: 'p1' } as any;
    (runners as any).runners = {
      r1: {
        getState: jest.fn().mockReturnValue({ pages: { main: page } }),
      },
    };
    env.setCurrent('env-1', { name: 'r1', page: 'main' });

    expect(runners.getActivePage()).toBe(page);
  });

  test('Runners getActivePage uses default current values', () => {
    const env = new Environment(true);
    env.createEnv({ envsId: 'env-1' });
    const runners = env.getEnvRunners('env-1');

    const page = { id: 'p1' } as any;
    (runners as any).runners = {
      '': {
        getState: jest.fn().mockReturnValue({ pages: { '': page } }),
      },
    };
    env.setCurrent('env-1', {} as any);

    expect(runners.getActivePage()).toBe(page);
  });

  test('Runners getRunnerByName returns runner instance', () => {
    const env = new Environment(true);
    env.createEnv({ envsId: 'env-1' });
    const runners = env.getEnvRunners('env-1');

    const runner = { id: 'r1' } as any;
    (runners as any).runners = { r1: runner };

    expect(runners.getRunnerByName('r1')).toBe(runner);
  });

  test('Runners closeRunner and closeAllRunners call stopEngine', async () => {
    const env = new Environment(true);
    env.createEnv({ envsId: 'env-1' });
    const runners = env.getEnvRunners('env-1');

    const stopEngine = jest.fn().mockResolvedValue(undefined);
    (runners as any).runners = {
      r1: { stopEngine },
      r2: { stopEngine },
    };

    await runners.closeRunner('r1');
    await runners.closeAllRunners();

    expect(stopEngine).toHaveBeenCalled();
  });

  test('Runner runEngine covers engines', async () => {
    const runnerP = new Runner({ name: 'r', type: 'runner', browser: { engine: 'puppeteer', runtime: 'run' } } as any);
    await runnerP.runEngine('env-1');
    expect((Engines as any).runPuppeteer).toHaveBeenCalled();

    const runnerW = new Runner({ name: 'r', type: 'runner', browser: { engine: 'playwright', runtime: 'run' } } as any);
    await runnerW.runEngine('env-1');
    expect((Engines as any).runPlaywright).toHaveBeenCalled();

    const runnerE = new Runner({ name: 'r', type: 'runner', browser: { type: 'electron', runtime: 'connect' } } as any);
    await runnerE.runEngine('env-1');
    expect((Engines as any).connectElectron).toHaveBeenCalled();

    const runnerERun = new Runner({ name: 'r', type: 'runner', browser: { type: 'electron', runtime: 'run' } } as any);
    await runnerERun.runEngine('env-1');
    expect((Engines as any).runElectron).toHaveBeenCalled();
  });

  test('Runner runEngine handles browser connect runtime', async () => {
    const runner = new Runner({ name: 'r', type: 'runner', browser: { type: 'browser', runtime: 'connect' } } as any);
    await runner.runEngine('env-1');
    expect((Engines as any).runPuppeteer).not.toHaveBeenCalled();
    expect((Engines as any).runPlaywright).not.toHaveBeenCalled();
  });

  test('Runner getters return data and state', () => {
    const runner = new Runner({ name: 'r', type: 'runner', browser: { engine: 'puppeteer' } } as any);
    expect(runner.getRunnerData().name).toBe('r');
    expect(runner.getState()).toEqual({});
  });

  test('Runner stopEngine handles platform kill paths', async () => {
    const runner = new Runner({
      name: 'r',
      type: 'runner',
      browser: { killOnEnd: true, killProcessName: 'app.exe' },
    } as any);

    (runner as any).state = { browser: { close: jest.fn().mockRejectedValue(new Error('x')) } };

    mockOs.platform.mockReturnValue('win32' as any);
    await runner.stopEngine();
    expect(mockSpawnSync).toHaveBeenCalledWith('taskkill', ['/f', '/im', 'app.exe']);

    mockOs.platform.mockReturnValue('darwin' as any);
    await runner.stopEngine();
    expect(mockExecSync).toHaveBeenCalledWith(`osascript -e 'quit app "app.exe"'`);

    mockOs.platform.mockReturnValue('linux' as any);
    await runner.stopEngine();
    expect(mockExecSync).toHaveBeenCalledWith('pkill app.exe');

    mockOs.platform.mockReturnValue('sunos' as any);
    await runner.stopEngine();
  });

  test('Runner stopEngine skips kill when process name missing', async () => {
    const runner = new Runner({ name: 'r', type: 'runner', browser: { killOnEnd: true } } as any);
    (runner as any).state = { browser: { close: jest.fn().mockResolvedValue(undefined) } };

    await runner.stopEngine();
    expect(mockSpawnSync).not.toHaveBeenCalled();
  });

  test('Runner stopEngine falls back when killOnEnd is false', async () => {
    const runner = new Runner({
      name: 'r',
      type: 'runner',
      browser: { killOnEnd: false, killProcessName: 'app.exe' },
    } as any);

    (runner as any).state = { browser: { close: jest.fn().mockResolvedValue(undefined) } };

    mockOs.platform.mockReturnValue('win32' as any);
    await runner.stopEngine();

    expect(mockSpawnSync).toHaveBeenCalledWith('taskkill', ['/f', '/im', 'app.exe']);
  });

  test('Runner stopEngine skips kill when browser config missing', async () => {
    const runner = new Runner({ name: 'r', type: 'runner' } as any);
    (runner as any).state = { browser: { close: jest.fn().mockResolvedValue(undefined) } };

    await runner.stopEngine();

    expect(mockSpawnSync).not.toHaveBeenCalled();
  });
});
