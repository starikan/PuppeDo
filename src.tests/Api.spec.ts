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
  logger: { log: jest.Mock; bulkLog: jest.Mock };
  log: Array<{ stepId: string }>;
  allRunners: { closeAllRunners: jest.Mock };
};

jest.mock('../src/Arguments');
jest.mock('../src/Blocker');
jest.mock('../src/Defaults');
jest.mock('../src/Environment');
jest.mock('../src/FlowStructure');
jest.mock('../src/getAgent');
jest.mock('../src/Helpers');
jest.mock('../src/PluginsCore');

const mockArguments = Arguments as jest.MockedClass<typeof Arguments>;
const mockBlocker = Blocker as jest.MockedClass<typeof Blocker>;
const mockResolveOptions = resolveOptions as jest.MockedFunction<typeof resolveOptions>;
const mockEnvironmentClass = Environment as jest.MockedClass<typeof Environment>;
const mockFlowStructure = FlowStructure as jest.Mocked<typeof FlowStructure>;
const mockGetAgent = getAgent as jest.MockedFunction<typeof getAgent>;
const mockGetTimer = getTimer as jest.MockedFunction<typeof getTimer>;
const mockGetNowDateTime = getNowDateTime as jest.MockedFunction<typeof getNowDateTime>;
const mockPluginsFabric = PluginsFabric as jest.MockedClass<typeof PluginsFabric>;

describe('Api.run', () => {
  let envInstance: MockedEnvInstance;
  let createEnv: jest.Mock;
  let getEnvInstance: jest.Mock;
  let getStruct: jest.Mock;
  let setCurrent: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    envInstance = {
      logger: {
        log: jest.fn().mockResolvedValue(undefined),
        bulkLog: jest.fn().mockResolvedValue(undefined),
      },
      log: [
        { stepId: 'step-1' },
        { stepId: 'step-2' },
      ],
      allRunners: {
        closeAllRunners: jest.fn().mockResolvedValue(undefined),
      },
    };

    createEnv = jest.fn().mockReturnValue({ envsId: 'env-1' });
    getEnvInstance = jest.fn().mockReturnValue(envInstance);
    getStruct = jest.fn().mockImplementation((_envsId: string, agentName: string) => ({ name: agentName }));
    setCurrent = jest.fn();

    mockEnvironmentClass.mockImplementation(
      () =>
        ({
          createEnv,
          getEnvInstance,
          getStruct,
          setCurrent,
        } as any),
    );

    mockBlocker.mockImplementation(() => ({ reset: jest.fn() } as any));

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

    mockFlowStructure.generateFlowDescription = jest.fn().mockReturnValue('flow');

    mockPluginsFabric.mockImplementation(() => ({} as any));

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
    mockArguments.mockImplementation(() => ({ args: { PPD_TESTS: [] } } as any));

    await expect(run({}, {})).rejects.toThrow('There is no tests to run. Pass any test in PPD_TESTS argument');
  });

  test('runs agents, collects logs and closes environment', async () => {
    jest.useFakeTimers();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    mockArguments.mockImplementation(() => ({ args: { PPD_TESTS: ['testA', 'testB'] } } as any));

    const mockAtomRun = jest.fn().mockResolvedValue({ ok: true });
    mockGetAgent.mockReturnValue(mockAtomRun as any);

    const result = await run({ PPD_TESTS: ['testA', 'testB'] }, { debug: true });

    jest.runAllTimers();

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
      testA: [
        { stepId: 'step-1' },
        { stepId: 'step-2' },
      ],
      testB: [],
    });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
    consoleSpy.mockRestore();
    jest.useRealTimers();
  });

  test('marks SyntaxError/TypeError as debug and rethrows', async () => {
    mockArguments.mockImplementation(() => ({ args: { PPD_TESTS: ['testA'] } } as any));

    const mockAtomRun = jest.fn().mockRejectedValue(new TypeError('bad'));
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
});
