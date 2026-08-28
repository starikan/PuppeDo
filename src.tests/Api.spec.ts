import type { Mock, Mocked, MockedClass, MockedFunction } from 'vitest';
import run from '../src/Api';
import { Arguments } from '../src/Arguments';
import Blocker from '../src/Blocker';
import { resolveOptions } from '../src/Defaults';
import { Environment } from '../src/Environment';
import FlowStructure from '../src/FlowStructure';
import getAgent from '../src/getAgent';
import { getNowDateTime, getTimer } from '../src/Helpers';
import { PluginsFabric } from '../src/PluginsCore';

type MockedEnvInstance = {
  logger: { log: Mock; bulkLog: Mock };
  log: Array<{ stepId: string }>;
  allRunners: { closeAllRunners: Mock };
};

vi.mock('../src/Arguments');
vi.mock('../src/Blocker');
vi.mock('../src/Defaults');
vi.mock('../src/Environment');
vi.mock('../src/FlowStructure');
vi.mock('../src/getAgent');
vi.mock('../src/Helpers');
vi.mock('../src/PluginsCore');

const mockArguments = Arguments as MockedClass<typeof Arguments>;
const mockBlocker = Blocker as MockedClass<typeof Blocker>;
const mockResolveOptions = resolveOptions as MockedFunction<typeof resolveOptions>;
const mockEnvironmentClass = Environment as MockedClass<typeof Environment>;
const mockFlowStructure = FlowStructure as Mocked<typeof FlowStructure>;
const mockGetAgent = getAgent as MockedFunction<typeof getAgent>;
const mockGetTimer = getTimer as MockedFunction<typeof getTimer>;
const mockGetNowDateTime = getNowDateTime as MockedFunction<typeof getNowDateTime>;
const mockPluginsFabric = PluginsFabric as MockedClass<typeof PluginsFabric>;

describe('Api.run', () => {
  let envInstance: MockedEnvInstance;
  let createEnv: Mock;
  let getEnvInstance: Mock;
  let getStruct: Mock;
  let setCurrent: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    envInstance = {
      logger: {
        log: vi.fn().mockResolvedValue(undefined),
        bulkLog: vi.fn().mockResolvedValue(undefined),
      },
      log: [{ stepId: 'step-1' }, { stepId: 'step-2' }],
      allRunners: {
        closeAllRunners: vi.fn().mockResolvedValue(undefined),
      },
    };

    createEnv = vi.fn().mockReturnValue({ envsId: 'env-1' });
    getEnvInstance = vi.fn().mockReturnValue(envInstance);
    getStruct = vi.fn().mockImplementation((_envsId: string, agentName: string) => ({ name: agentName }));
    setCurrent = vi.fn();

    mockEnvironmentClass.mockImplementation(function () {
      return {
        createEnv,
        getEnvInstance,
        getStruct,
        setCurrent,
      } as any;
    });

    mockBlocker.mockImplementation(function () {
      return { reset: vi.fn() } as any;
    });

    mockGetTimer.mockImplementation(
      ({
        timeStartBigInt,
        timeEndBigInt,
        timeStart,
        timeEnd,
      }: { timeStartBigInt?: bigint; timeEndBigInt?: bigint; timeStart?: Date; timeEnd?: Date } = {}) => {
        const resolvedStartBigInt = timeStartBigInt ?? 100n;
        const resolvedEndBigInt = timeEndBigInt ?? 200n;
        const resolvedStart = timeStart ?? new Date('2025-01-01T00:00:00.000Z');
        const resolvedEnd = timeEnd ?? new Date('2025-01-01T00:00:01.000Z');
        return {
          timeStart: resolvedStart,
          timeEnd: resolvedEnd,
          timeStartBigInt: resolvedStartBigInt,
          timeEndBigInt: resolvedEndBigInt,
          deltaStr: '1s',
          delta: 1,
        };
      },
    );
    mockGetNowDateTime.mockReturnValue('2025-01-01 00:00:00');

    mockFlowStructure.generateFlowDescription = vi.fn().mockReturnValue('flow');

    mockPluginsFabric.mockImplementation(function () {
      return {} as any;
    });

    mockResolveOptions.mockReturnValue({
      loggerPipes: [],
      pluginsList: { mock: true },
      argsConfig: { custom: true },
      stdOut: true,
      socket: {} as any,
      closeAllEnvs: true,
      closeProcess: true,
      globalConfigFile: 'puppedo.config.js',
      debug: true,
    } as any);
  });

  test('throws when no tests provided', async () => {
    mockArguments.mockImplementation(function () {
      return { args: { PPD_TESTS: [] } } as any;
    });

    await expect(run({}, {})).rejects.toThrow('There is no tests to run. Pass any test in PPD_TESTS argument');
  });

  test('runs agents, collects logs and closes environment', async () => {
    vi.useFakeTimers();
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    mockArguments.mockImplementation(function () {
      return { args: { PPD_TESTS: ['testA', 'testB'] } } as any;
    });

    const mockAtomRun = vi.fn().mockResolvedValue({ ok: true });
    mockGetAgent.mockReturnValue(mockAtomRun as any);

    const result = await run({ PPD_TESTS: ['testA', 'testB'] }, { debug: true });

    vi.runAllTimers();

    expect(mockPluginsFabric).toHaveBeenCalledWith({ mock: true }, true);
    expect(createEnv).toHaveBeenCalledTimes(1);
    expect(getStruct).toHaveBeenCalledWith('env-1', 'testA');
    expect(getStruct).toHaveBeenCalledWith('env-1', 'testB');
    expect(setCurrent).toHaveBeenCalledWith('env-1', { name: 'testA' });
    expect(setCurrent).toHaveBeenCalledWith('env-1', { name: 'testB' });
    expect(envInstance.logger.log).toHaveBeenCalled();
    expect(envInstance.logger.bulkLog).toHaveBeenCalled();
    expect(envInstance.allRunners.closeAllRunners).toHaveBeenCalled();

    expect(result.results).toEqual({
      testA: { ok: true },
      testB: { ok: true },
    });
    expect(result.logs).toEqual({
      testA: [{ stepId: 'step-1' }, { stepId: 'step-2' }],
      testB: [],
    });

    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
    vi.useRealTimers();
  });

  test('marks SyntaxError/TypeError as debug and rethrows', async () => {
    mockArguments.mockImplementation(function () {
      return { args: { PPD_TESTS: ['testA'] } } as any;
    });

    const mockAtomRun = vi.fn().mockRejectedValue(new TypeError('bad'));
    mockGetAgent.mockReturnValue(mockAtomRun as any);

    let thrown: any;
    try {
      await run({}, {});
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(TypeError);
    expect(thrown.debug).toBe(true);
    expect(thrown.type).toBe('SyntaxError');
  });

  test('does not set debug for non SyntaxError/TypeError', async () => {
    mockArguments.mockImplementation(function () {
      return { args: { PPD_TESTS: ['testA'] } } as any;
    });

    const mockAtomRun = vi.fn().mockRejectedValue(new Error('boom'));
    mockGetAgent.mockReturnValue(mockAtomRun as any);

    let thrown: any;
    try {
      await run({}, {});
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect(thrown.debug).toBeUndefined();
    expect(thrown.type).toBeUndefined();
  });

  test('skips debug logging and close steps when disabled', async () => {
    vi.useFakeTimers();
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    mockArguments.mockImplementation(function () {
      return { args: { PPD_TESTS: ['testA'] } } as any;
    });
    mockResolveOptions.mockReturnValue({
      loggerPipes: [],
      pluginsList: { mock: true },
      argsConfig: {},
      stdOut: true,
      socket: {} as any,
      closeAllEnvs: false,
      closeProcess: false,
      globalConfigFile: 'puppedo.config.js',
      debug: false,
    } as any);

    const mockAtomRun = vi.fn().mockResolvedValue({ ok: true });
    mockGetAgent.mockReturnValue(mockAtomRun as any);

    const result = await run({ PPD_TESTS: ['testA'] }, { debug: false, closeAllEnvs: false, closeProcess: false });

    vi.runAllTimers();

    expect(envInstance.logger.log).not.toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining('Args:') }),
    );
    expect(envInstance.allRunners.closeAllRunners).not.toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
    expect(result.results).toEqual({ testA: { ok: true } });

    exitSpy.mockRestore();
    vi.useRealTimers();
  });

  test('uses default arguments when called without params', async () => {
    vi.useFakeTimers();
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    mockArguments.mockImplementation(function () {
      return { args: { PPD_TESTS: ['testA'] } } as any;
    });

    mockResolveOptions.mockReturnValue({
      loggerPipes: [],
      pluginsList: { mock: true },
      argsConfig: {},
      stdOut: true,
      socket: {} as any,
      closeAllEnvs: true,
      closeProcess: false,
      globalConfigFile: 'puppedo.config.js',
      debug: false,
    } as any);

    const mockAtomRun = vi.fn().mockResolvedValue({ ok: true });
    mockGetAgent.mockReturnValue(mockAtomRun as any);

    const result = await run();

    vi.runAllTimers();

    expect(createEnv).toHaveBeenCalledTimes(1);
    expect(getStruct).toHaveBeenCalledWith('env-1', 'testA');
    expect(result.results).toEqual({ testA: { ok: true } });

    expect(exitSpy).not.toHaveBeenCalled();
    exitSpy.mockRestore();
    vi.useRealTimers();
  });
});
