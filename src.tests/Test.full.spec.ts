import { EventEmitter } from 'events';
import { Arguments } from '../src/Arguments';
import Blocker from '../src/Blocker';
import Atom from '../src/AtomCore';
import { ContinueParentError, TestError } from '../src/Error';
import { Environment } from '../src/Environment';
import { logDebug } from '../src/Loggers/CustomLogEntries';
import { Test, checkIf } from '../src/Test';

jest.mock('../src/Environment');
jest.mock('../src/Blocker');
jest.mock('../src/AtomCore');
jest.mock('../src/Loggers/CustomLogEntries', () => ({ logDebug: jest.fn() }));
jest.mock('../src/TestContent', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    allData: {
      data: [{ name: 'extData', data: { ext: 7 } }],
      selectors: [{ name: 'extSel', data: { extSel: 'ext-selector' } }],
      runners: [],
    },
  })),
}));

const mockEnvironmentClass = Environment as jest.MockedClass<typeof Environment>;
const mockBlockerClass = Blocker as jest.MockedClass<typeof Blocker>;
const mockAtomClass = Atom as jest.MockedClass<typeof Atom>;
const mockLogDebug = logDebug as jest.MockedFunction<typeof logDebug>;

const buildPlugins = (overrides: Record<string, any> = {}): any => {
  const argsRedefine = {
    PPD_LOG_EXTEND: false,
    PPD_LOG_AGENT_NAME: true,
    PPD_TAGS_TO_RUN: [],
    PPD_LOG_DOCUMENTATION_MODE: false,
    PPD_LOG_NAMES_ONLY: [],
    PPD_LOG_TIMER_SHOW: true,
    PPD_LOG_STEPID: false,
    ...(overrides.argsRedefine ?? {}),
  };

  const pluginsValues = {
    argsRedefine: { argsRedefine },
    debug: { debug: false, ...(overrides.debug ?? {}) },
    logOptions: { logOptions: { logShowFlag: true, screenshot: false, ...(overrides.logOptions ?? {}) } },
    skipSublingIfResult: { skipMeBecausePrevSublingResults: false, ...(overrides.skipSublingIfResult ?? {}) },
    selectors: { selectors: { ...(overrides.selectors ?? {}) } },
    options: { options: { ...(overrides.options ?? {}) } },
    continueOnError: { continueOnError: false, ...(overrides.continueOnError ?? {}) },
    descriptionError: { descriptionError: '', ...(overrides.descriptionError ?? {}) },
  };

  return {
    hook: jest.fn(),
    getPlugins: jest.fn((name: string) => {
      const entry = pluginsValues[name];
      if (name === 'argsRedefine') {
        return {
          getValue: jest.fn().mockReturnValue(entry.argsRedefine),
          getValues: jest.fn().mockReturnValue(entry),
        };
      }
      return { getValues: jest.fn().mockReturnValue(entry) };
    }),
  };
};

const setupEnv = (plugins: any) => {
  const logger = { log: jest.fn().mockResolvedValue(undefined) } as any;
  const page = { id: 'page' } as any;
  const runner = {
    getRunnerData: jest.fn().mockReturnValue({ data: { runnerData: 1 }, selectors: { runnerSel: 2 } }),
    getState: jest.fn().mockReturnValue({ pages: { main: page }, browser: {} }),
  } as any;
  const allRunners = { getRunnerByName: jest.fn().mockReturnValue(runner) } as any;
  const testTree = {
    createStep: jest.fn(),
    updateStep: jest.fn(),
    findNode: jest.fn(),
    findParent: jest.fn(),
    addError: jest.fn(),
    getErrors: jest.fn().mockReturnValue([{ stepId: 's1' }]),
    clearErrors: jest.fn(),
  } as any;

  const envInstance = {
    testTree,
    plugins,
    logger,
    testsStruct: {},
    allRunners,
    current: { name: 'runner', page: 'main' },
  } as any;

  const envApi = {
    getEnvInstance: jest.fn().mockReturnValue(envInstance),
    getCurrent: jest.fn().mockReturnValue(envInstance.current),
    setCurrent: jest.fn(),
    getEnvRunners: jest.fn().mockReturnValue(allRunners),
  } as any;

  mockEnvironmentClass.mockImplementation(() => envApi);

  return { logger, runner, testTree, envInstance, envApi };
};

describe('Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    new Arguments({ PPD_LIFE_CYCLE_FUNCTIONS: [] }, {}, true);

    mockBlockerClass.mockImplementation(
      () => ({
        getBlock: jest.fn().mockReturnValue(null),
        blockEmitter: new EventEmitter(),
        setBlock: jest.fn(),
      }) as any,
    );

    mockAtomClass.mockImplementation(
      () =>
        ({
          getElement: jest.fn(async (selector: string) => (selector === 'arr' ? [{ id: 1 }, { id: 2 }] : { id: 3 })),
        }) as any,
    );
  });

  test('checkIf handles skip and error branches', async () => {
    const log = jest.fn().mockResolvedValue(undefined);
    const plugins = buildPlugins({ argsRedefine: { PPD_LOG_STEPID: true } });
    const agent = { levelIndent: 0, breadcrumbs: ['b'], stepId: 's1' } as any;

    const skipped = await checkIf('false', 'if', log, plugins, agent, {});
    expect(skipped).toBe(true);
    expect(log).toHaveBeenCalledWith(expect.objectContaining({ level: 'info' }));

    await expect(checkIf('true', 'errorIf', log, plugins, agent, {})).rejects.toThrow(
      "Test stopped with expr errorIf = 'true'",
    );
  });

  test('checkIf skips logging when continueOnError and error', async () => {
    const log = jest.fn().mockResolvedValue(undefined);
    const plugins = buildPlugins({
      continueOnError: { continueOnError: true },
      argsRedefine: { PPD_LOG_STEPID: false },
    });
    const agent = { levelIndent: 0, breadcrumbs: [], stepId: 's2' } as any;

    await expect(checkIf('true', 'errorIfResult', log, plugins, agent, {})).rejects.toThrow(
      "Test stopped with expr errorIfResult = 'true'",
    );
    expect(log).not.toHaveBeenCalled();
  });

  test('checkIf uses default agent fields', async () => {
    const log = jest.fn().mockResolvedValue(undefined);
    const plugins = buildPlugins({ argsRedefine: { PPD_LOG_STEPID: false } });
    const agent = { stepId: 's1' } as any;

    const skipped = await checkIf('false', 'if', log, plugins, agent);

    expect(skipped).toBe(true);
    expect(log).toHaveBeenCalled();
  });

  test('runLogic skips disabled agent and resets flag', async () => {
    const plugins = buildPlugins();
    const { logger } = setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', disable: true } as any);

    const result = await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', disable: true } as any);

    expect(result).toEqual({ result: {} });
    expect(test.agent.disable).toBe(false);
    expect(logger.log).toHaveBeenCalled();
  });

  test('runLogic supports array needs', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const test = new Test({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      needData: [['a', 'b']] as any,
    } as any);

    await expect(test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any)).rejects.toBeInstanceOf(
      TestError,
    );
  });

  test('runLogic ignores missing ext data and selectors', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const test = new Test({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      dataExt: ['missing'],
      selectorsExt: ['missingSel'],
    } as any);

    await test.runLogic({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      dataExt: ['missing'],
      selectorsExt: ['missingSel'],
    } as any);
  });

  test('runLogic handles missing runner data', async () => {
    const plugins = buildPlugins();
    const { envInstance } = setupEnv(plugins);
    envInstance.allRunners.getRunnerByName = jest.fn().mockReturnValue(undefined);

    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);
    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);
  });

  test('runLogic logs default description text when empty', async () => {
    const plugins = buildPlugins({ argsRedefine: { PPD_LOG_AGENT_NAME: false } });
    const { logger } = setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'n', description: '' } as any);

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'n', description: '' } as any);

    expect(logger.log).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining('TODO: Fill description') }));
  });

  test('runLogic skips by tags', async () => {
    const plugins = buildPlugins({ argsRedefine: { PPD_TAGS_TO_RUN: ['only'] } });
    const { logger } = setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', tags: ['other'] } as any);

    const result = await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', tags: ['other'] } as any);

    expect(result).toEqual({ result: {} });
    expect(logger.log).toHaveBeenCalled();
  });

  test('runLogic logs tags skip with stepId when enabled', async () => {
    const plugins = buildPlugins({ argsRedefine: { PPD_TAGS_TO_RUN: ['only'], PPD_LOG_STEPID: true } });
    const { logger } = setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', tags: ['other'] } as any);

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', tags: ['other'] } as any);

    expect(logger.log).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining('[s1]') }));
  });

  test('runLogic skips because previous sibling result', async () => {
    const plugins = buildPlugins({ skipSublingIfResult: { skipMeBecausePrevSublingResults: true } });
    const { logger } = setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);

    const result = await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);

    expect(result).toEqual({ result: {} });
    expect(logger.log).toHaveBeenCalled();
  });

  test('runLogic logs skip reason for previous sibling results', async () => {
    const plugins = buildPlugins({ skipSublingIfResult: { skipMeBecausePrevSublingResults: true } });
    const { logger } = setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);

    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining('skipMeBecausePrevSublingResults') }),
    );
  });

  test('runLogic skip reason includes stepId when enabled', async () => {
    const plugins = buildPlugins({
      skipSublingIfResult: { skipMeBecausePrevSublingResults: true },
      argsRedefine: { PPD_LOG_STEPID: true },
    });
    const { logger } = setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);

    expect(logger.log).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining('[s1]') }));
  });

  test('runLogic full flow with repeat and logs', async () => {
    new Arguments(
      {
        PPD_DATA: { base: 1 },
        PPD_SELECTORS: { baseSel: 'base' },
        PPD_LIFE_CYCLE_FUNCTIONS: ['beforeRun'],
      },
      {},
      true,
    );

    const plugins = buildPlugins({
      argsRedefine: { PPD_LOG_DOCUMENTATION_MODE: true, PPD_LOG_STEPID: true },
      logOptions: { screenshot: true, logShowFlag: true },
      selectors: { selOne: 'one', selArr: 'arr' },
      options: { opt: 1 },
    });

    const { logger } = setupEnv(plugins);
    const initValues = {
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      name: 'agent',
      description: '',
      bindDescription: 'required + "-" + local',
      descriptionExtend: ['doc1', 'doc2'],
      data: { local: 2 },
      dataParent: { required: 1 },
      dataExt: ['extData'],
      selectorsExt: ['extSel'],
      resultsFromPrevSubling: { prev: 9 },
      needData: ['required', 'optional?'],
      needSelectors: ['selOne', 'selArr', 'missing?'],
      bindData: { computed: 'required + 1', bad: 'invalid(' },
      bindSelectors: { computedSel: 'required + 2' },
      bindResults: { sum: 'foo + bar' },
      allowResults: ['foo', 'bar'],
      repeat: 2,
      debugInfo: true,
      errorIfResult: 'false',
      atomRun: async () => ({ foo: 1 }),
      beforeRun: [async () => ({ bar: 2 })],
    } as any;

    const test = new Test(initValues as any);

    test.agent.debug = true;
    test.run = jest.fn().mockResolvedValue({ result: { extra: 10 } }) as any;

    const result = await test.runLogic(initValues as any);

    expect(result.result.foo).toBe(1);
    expect(result.result.bar).toBe(2);
    expect((result.result as any).result.extra).toBe(10);
    expect(logger.log).toHaveBeenCalled();
    expect(mockLogDebug).toHaveBeenCalled();
    expect(test.run).toHaveBeenCalled();
  });

  test('runLogic sets red background when description missing', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', description: '' } as any);

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);

    expect(test.agent.logOptions.backgroundColor).toBe('red');
  });

  test('runLogic handles null resultsFromPrevSubling', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const test = new Test({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
    } as any);

    test.agent.resultsFromPrevSubling = null as any;

    await test.runLogic({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      resultsFromPrevSubling: null,
    } as any);

    expect(test.agent.resultsFromPrevSubling).toBeNull();
  });

  test('runLogic handles missing current page for pageCurrent', async () => {
    const plugins = buildPlugins();
    const { envInstance } = setupEnv(plugins);
    envInstance.current = { name: 'runner' } as any;

    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);
    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);
  });

  test('runLogic handles null current for pageCurrent', async () => {
    const plugins = buildPlugins();
    const { envApi } = setupEnv(plugins);
    envApi.getCurrent.mockReturnValue(null);

    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);
    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);
  });

  test('runLogic logs element when Atom returns single element', async () => {
    const plugins = buildPlugins({ logOptions: { screenshot: true }, selectors: { selOne: 'one' } });
    const { logger } = setupEnv(plugins);
    mockAtomClass.mockImplementationOnce(
      () =>
        ({
          getElement: jest.fn().mockResolvedValue({ id: 1 }),
        }) as any,
    );

    const test = new Test({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      needSelectors: ['selOne'],
    } as any);

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);

    expect(logger.log).toHaveBeenCalledWith(expect.objectContaining({ element: { id: 1 } }));
  });

  test('runLogic skips element push when Atom returns null', async () => {
    const plugins = buildPlugins({ logOptions: { screenshot: true }, selectors: { selOne: 'one' } });
    const { logger } = setupEnv(plugins);
    mockAtomClass.mockImplementationOnce(
      () =>
        ({
          getElement: jest.fn().mockResolvedValue(null),
        }) as any,
    );

    const test = new Test({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      needSelectors: ['selOne'],
    } as any);

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);

    expect(logger.log).toHaveBeenCalledWith(expect.objectContaining({ element: null }));
  });

  test('runLogic handles lifecycle functions returning undefined', async () => {
    new Arguments({ PPD_LIFE_CYCLE_FUNCTIONS: ['run'] }, {}, true);
    const plugins = buildPlugins();
    setupEnv(plugins);
    const test = new Test({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      run: async () => undefined,
    } as any);

    const result = await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);

    expect(result).toEqual({ result: {} });
  });

  test('runLogic while increments repeat without loop', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const test = new Test({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      repeat: 0,
      while: 'true',
    } as any);

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);

    expect(test.agent.repeat).toBe(1);
  });

  test('runLogic breakParentIfResult throws ContinueParentError', async () => {
    const plugins = buildPlugins();
    const { logger } = setupEnv(plugins);
    const test = new Test({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      breakParentIfResult: 'true',
    } as any);

    await expect(test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any)).rejects.toBeInstanceOf(
      ContinueParentError,
    );
    expect(logger.log).toHaveBeenCalled();
  });

  test('runLogic returns localResults for ContinueParentError with level 0', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const test = new Test({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      atomRun: async () => {
        throw new ContinueParentError({
          localResults: { ok: true },
          errorLevel: 0,
          logger: { log: jest.fn() } as any,
          test: {} as any,
          agent: { stepId: 's1', breadcrumbs: [], breakParentIfResult: '', levelIndent: 0 } as any,
        });
      },
    } as any);

    const result = await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);

    expect(result).toEqual({ result: { ok: true } });
  });

  test('runLogic continues on error when enabled', async () => {
    const plugins = buildPlugins({ continueOnError: { continueOnError: true } });
    const { logger } = setupEnv(plugins);
    const test = new Test({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      needData: ['missing'],
    } as any);

    const result = await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);

    expect(result).toEqual({ result: undefined });
    expect(logger.log).toHaveBeenCalled();
  });

  test('runLogic wraps errors into TestError', async () => {
    const plugins = buildPlugins();
    const { logger } = setupEnv(plugins);
    const test = new Test({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      allowResults: ['a', 'b'],
      atomRun: async () => ({ a: 1 }),
    } as any);

    await expect(test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any)).rejects.toBeInstanceOf(
      TestError,
    );
    expect(logger.log).toHaveBeenCalled();
  });

  test('runLogic enters debug branch when plugin debug enabled', async () => {
    const plugins = buildPlugins({ debug: { debug: true } });
    setupEnv(plugins);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);
    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('runLogic logs debugInfo without debug flag', async () => {
    const plugins = buildPlugins({ debug: { debug: false } });
    setupEnv(plugins);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', debugInfo: true } as any);
    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', debugInfo: true } as any);

    expect(mockLogDebug).toHaveBeenCalled();
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('runLogic throws when required env param missing', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const test = new Test({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      needEnvParams: ['MISSING_ENV'],
    } as any);

    await expect(
      test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', needEnvParams: ['MISSING_ENV'] } as any),
    ).rejects.toBeInstanceOf(TestError);
  });

  test('runLogic throws on intersecting data/selectors', async () => {
    const plugins = buildPlugins({ selectors: { same: 2 } });
    setupEnv(plugins);
    const test = new Test({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      data: { same: 1 },
    } as any);

    await expect(
      test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', data: { same: 1 } } as any),
    ).rejects.toBeInstanceOf(TestError);
  });

  test('runLogic handles errorIf condition', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', errorIf: 'true' } as any);

    await expect(
      test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', errorIf: 'true' } as any),
    ).rejects.toBeInstanceOf(TestError);
  });

  test('runLogic skips when if condition is false', async () => {
    const plugins = buildPlugins();
    const { logger } = setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', if: 'false' } as any);

    const result = await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', if: 'false' } as any);

    expect(result).toEqual({ result: {} });
    expect(logger.log).toHaveBeenCalled();
  });

  test('runLogic continues when if condition is true', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', if: 'true' } as any);

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', if: 'true' } as any);
  });

  test('runLogic logs with null element when no screenshots', async () => {
    const plugins = buildPlugins({ logOptions: { screenshot: false } });
    const { logger } = setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);

    expect(logger.log).toHaveBeenCalledWith(expect.objectContaining({ element: null }));
  });

  test('runLogic logs element for non-array selector', async () => {
    const plugins = buildPlugins({ logOptions: { screenshot: true }, selectors: { selOne: 'one' } });
    const { logger } = setupEnv(plugins);
    const test = new Test({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      name: 'agent',
      needSelectors: ['selOne'],
    } as any);

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);

    expect(logger.log).toHaveBeenCalledWith(expect.objectContaining({ element: { id: 3 } }));
  });

  test('runLogic uses previous repeat when input repeat is falsy', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const initValues = { envsId: 'env-1', stepId: 's1', stepIdParent: '', repeat: 2 } as any;
    const test = new Test(initValues);
    test.run = jest.fn().mockResolvedValue({ result: {} }) as any;

    await test.runLogic({ ...initValues, repeat: 0 } as any);

    expect(test.agent.repeat).toBe(2);
    expect(test.run).toHaveBeenCalled();
  });

  test('runLogic preserves repeat when input missing', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const initValues = { envsId: 'env-1', stepId: 's1', stepIdParent: '', repeat: 3 } as any;
    const test = new Test(initValues);
    test.run = jest.fn().mockResolvedValue({ result: {} }) as any;

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);

    expect(test.agent.repeat).toBe(3);
  });

  test('runLogic keeps stepId when input missing', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 'orig', stepIdParent: '' } as any);

    await test.runLogic({ envsId: 'env-1', stepIdParent: '' } as any);

    expect(test.agent.stepId).toBe('orig');
  });

  test('runLogic falls back when descriptionExtend/dataParent unset', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);
    test.agent.descriptionExtend = undefined as any;
    test.agent.dataParent = undefined as any;

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);

    expect(test.agent.descriptionExtend).toEqual([]);
    expect(test.agent.dataParent).toEqual({});
  });

  test('runLogic ignores optional env params', async () => {
    const plugins = buildPlugins();
    const { logger } = setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', needEnvParams: ['OPTIONAL?'] } as any);

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', needEnvParams: ['OPTIONAL?'] } as any);

    expect(logger.log).toHaveBeenCalled();
  });

  test('runLogic handles missing current page', async () => {
    const plugins = buildPlugins({ logOptions: { screenshot: false } });
    const { logger, envInstance } = setupEnv(plugins);
    envInstance.current.page = 'missing';

    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);
    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);

    expect(logger.log).toHaveBeenCalled();
  });

  test('runLogic uses current name fallback', async () => {
    const plugins = buildPlugins();
    const { envInstance } = setupEnv(plugins);
    envInstance.current.name = '';

    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);
    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);
  });

  test('runLogic skips log output when name not in PPD_LOG_NAMES_ONLY', async () => {
    const plugins = buildPlugins({
      argsRedefine: { PPD_LOG_NAMES_ONLY: ['other'] },
      logOptions: { screenshot: true },
    });
    setupEnv(plugins);

    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);
    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);

    expect(mockAtomClass).not.toHaveBeenCalled();
  });

  test('runLogic keeps repeat when while condition is false', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', repeat: 1, while: 'false' } as any);

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', while: 'false' } as any);

    expect(test.agent.repeat).toBe(1);
  });

  test('runLogic does not break parent when condition is false', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const test = new Test({
      envsId: 'env-1',
      stepId: 's1',
      stepIdParent: '',
      breakParentIfResult: 'false',
      atomRun: async () => ({ ok: true }),
    } as any);

    const result = await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);

    expect(result.result).toEqual({});
  });

  test('runLogic sets timer logShowFlag to false when disabled', async () => {
    const plugins = buildPlugins({ argsRedefine: { PPD_LOG_TIMER_SHOW: false, PPD_LOG_EXTEND: false } });
    const { logger } = setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);

    await test.runLogic({ envsId: 'env-1', stepId: 's1', stepIdParent: '', name: 'agent' } as any);

    const timerCall = (logger.log as jest.Mock).mock.calls.find((call) => call[0]?.level === 'timer');
    expect(timerCall?.[0].logOptions?.logShowFlag).toBe(false);
  });

  test('run waits for blocker to unblock', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const emitter = new EventEmitter();

    mockBlockerClass.mockImplementation(
      () => ({
        getBlock: jest.fn().mockReturnValue({ stepId: 's1', block: true }),
        blockEmitter: emitter,
      }) as any,
    );

    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);
    test.runLogic = jest.fn().mockResolvedValue({ result: { done: true } }) as any;

    const runPromise = test.run({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);

    emitter.emit('updateBlock', { stepId: 'other', block: true });
    emitter.emit('updateBlock', { stepId: 's1', block: false });

    await expect(runPromise).resolves.toEqual({ result: { done: true } });
    expect(test.runLogic).toHaveBeenCalled();
  });

  test('run executes immediately when no block', async () => {
    const plugins = buildPlugins();
    setupEnv(plugins);
    const test = new Test({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any);
    test.runLogic = jest.fn().mockResolvedValue({ result: { ok: true } }) as any;

    await expect(test.run({ envsId: 'env-1', stepId: 's1', stepIdParent: '' } as any)).resolves.toEqual({
      result: { ok: true },
    });
  });
});
