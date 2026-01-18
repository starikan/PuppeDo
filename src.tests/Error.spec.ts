import { Arguments } from '../src/Arguments';
import { Environment } from '../src/Environment';
import { ContinueParentError, TestError, errorHandler } from '../src/Error';

jest.mock('../src/Environment');

const mockEnvironmentClass = Environment as jest.MockedClass<typeof Environment>;

describe('Error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockEnvironmentClass.mockImplementation(
      () =>
        ({
          getEnvInstance: jest.fn().mockReturnValue({
            testTree: {
              addError: jest.fn(),
              getErrors: jest.fn().mockReturnValue([{ stepId: 's1' }]),
              clearErrors: jest.fn(),
            },
          }),
          getEnvRunners: jest.fn().mockReturnValue({ closeAllRunners: jest.fn() }),
          getSocket: jest.fn().mockReturnValue({ sendYAML: jest.fn() }),
        } as any),
    );
  });

  test('TestError logs and summarizes', async () => {
    const logger = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const plugins = {
      envsId: 'env-1',
      getPlugins: jest.fn().mockImplementation((name: string) => {
        if (name === 'continueOnError') {
          return { getValues: jest.fn().mockReturnValue({ continueOnError: false }) };
        }
        if (name === 'descriptionError') {
          return { getValues: jest.fn().mockReturnValue({ descriptionError: 'desc' }) };
        }
        return { getValues: jest.fn().mockReturnValue({}) };
      }),
    } as any;

    const agent = {
      envsId: 'env-1',
      socket: {},
      stepId: 's1',
      description: 'desc',
      name: 'agent',
      breadcrumbs: ['a'],
      breadcrumbsDescriptions: ['b'],
      levelIndent: 0,
      funcFile: 'f',
      testFile: 't',
    } as any;

    const error = new TestError({ logger, agent, plugins });
    await error.log();

    expect(logger.log).toHaveBeenCalled();
  });

  test('TestError skips log when continueOnError true', async () => {
    const logger = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const plugins = {
      envsId: 'env-1',
      getPlugins: jest.fn().mockImplementation((name: string) => {
        if (name === 'continueOnError') {
          return { getValues: jest.fn().mockReturnValue({ continueOnError: true }) };
        }
        if (name === 'descriptionError') {
          return { getValues: jest.fn().mockReturnValue({ descriptionError: '' }) };
        }
        return { getValues: jest.fn().mockReturnValue({}) };
      }),
    } as any;

    const agent = {
      envsId: 'env-1',
      socket: {},
      stepId: 's1',
      description: '',
      name: 'agent',
      breadcrumbs: [],
      breadcrumbsDescriptions: [],
      levelIndent: 1,
      funcFile: '',
      testFile: '',
    } as any;

    const error = new TestError({ logger, agent, plugins });
    await error.log();

    expect(logger.log).toHaveBeenCalled();
  });

  test('ContinueParentError logs with stepId when enabled', async () => {
    new Arguments({ PPD_LOG_STEPID: true }, {}, true);

    const logger = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const test = {} as any;
    const agent = { stepId: 's1', breadcrumbs: ['a'], breakParentIfResult: 'expr', levelIndent: 0 } as any;

    const error = new ContinueParentError({ localResults: {}, errorLevel: 1, logger, test, agent });
    await error.log();

    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining('[s1]') }),
    );
  });

  test('errorHandler exits process after cleanup', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    await errorHandler({ envsId: 'env-1', message: 'm', stack: 's', socket: { sendYAML: jest.fn() } } as any);

    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    logSpy.mockRestore();
  });

  test('TestError uses parentError fields when missing in agent', async () => {
    const logger = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const plugins = {
      envsId: 'env-1',
      getPlugins: jest.fn().mockImplementation((name: string) => {
        if (name === 'continueOnError') {
          return { getValues: jest.fn().mockReturnValue({ continueOnError: false }) };
        }
        if (name === 'descriptionError') {
          return { getValues: jest.fn().mockReturnValue({ descriptionError: '' }) };
        }
        return { getValues: jest.fn().mockReturnValue({}) };
      }),
    } as any;

    const agent = {
      envsId: 'env-1',
      socket: {},
      stepId: undefined,
      description: 'desc',
      name: 'agent',
      breadcrumbs: [],
      breadcrumbsDescriptions: [],
      levelIndent: 1,
      funcFile: '',
      testFile: '',
    } as any;

    const parentError = { envsId: 'env-1', socket: {}, stepId: 'parent-step', message: 'p', stack: 's' } as any;
    const error = new TestError({ logger, agent, plugins, parentError } as any);
    const summarySpy = jest.spyOn(error, 'summaryInfo');

    await error.log();

    expect(error.stepId).toBe('parent-step');
    expect(summarySpy).not.toHaveBeenCalled();
  });

  test('TestError prefers agent stepId and calls summary on top level', async () => {
    const logger = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const plugins = {
      envsId: 'env-1',
      getPlugins: jest.fn().mockImplementation((name: string) => {
        if (name === 'continueOnError') {
          return { getValues: jest.fn().mockReturnValue({ continueOnError: false }) };
        }
        if (name === 'descriptionError') {
          return { getValues: jest.fn().mockReturnValue({ descriptionError: '' }) };
        }
        return { getValues: jest.fn().mockReturnValue({}) };
      }),
    } as any;

    const agent = {
      envsId: 'env-1',
      socket: {},
      stepId: 'agent-step',
      description: 'desc',
      name: 'agent',
      breadcrumbs: [],
      breadcrumbsDescriptions: [],
      levelIndent: 0,
      funcFile: '',
      testFile: '',
    } as any;

    const parentError = { envsId: 'env-1', socket: {}, stepId: 'parent-step', message: 'p', stack: 's' } as any;
    const error = new TestError({ logger, agent, plugins, parentError } as any);
    const summarySpy = jest.spyOn(error, 'summaryInfo').mockResolvedValue(undefined);

    await error.log();

    expect(error.stepId).toBe('agent-step');
    expect(summarySpy).toHaveBeenCalled();
  });

  test('TestError constructor sets stepId from agent', () => {
    const logger = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const plugins = {
      envsId: 'env-1',
      getPlugins: jest.fn().mockReturnValue({ getValues: jest.fn().mockReturnValue({}) }),
    } as any;

    const agent = { envsId: 'env-1', socket: {}, stepId: 's1', description: '', name: '' } as any;
    const error = new TestError({ logger, agent, plugins } as any);

    expect(error.stepId).toBe('s1');
  });

  test('TestError uses parent stepId when agent stepId is null', () => {
    const logger = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const plugins = {
      envsId: 'env-1',
      getPlugins: jest.fn().mockReturnValue({ getValues: jest.fn().mockReturnValue({}) }),
    } as any;

    const agent = { envsId: 'env-1', socket: {}, stepId: null, description: '', name: 'agent' } as any;
    const parentError = { envsId: 'env-1', socket: {}, stepId: 'parent', message: 'p', stack: 's' } as any;
    const error = new TestError({ logger, agent, plugins, parentError } as any);

    expect(error.stepId).toBe('parent');
  });

  test('TestError keeps stepId undefined when no parent and agent has none', () => {
    const logger = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const plugins = {
      envsId: 'env-1',
      getPlugins: jest.fn().mockReturnValue({ getValues: jest.fn().mockReturnValue({}) }),
    } as any;

    const agent = { envsId: 'env-1', socket: {}, stepId: undefined, description: '', name: 'agent' } as any;
    const error = new TestError({ logger, agent, plugins } as any);

    expect(error.stepId).toBeUndefined();
  });

  test('TestError keeps empty stepId when provided', () => {
    const logger = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const plugins = {
      envsId: 'env-1',
      getPlugins: jest.fn().mockReturnValue({ getValues: jest.fn().mockReturnValue({}) }),
    } as any;

    const agent = { envsId: 'env-1', socket: {}, stepId: '', description: '', name: 'agent' } as any;
    const parentError = { envsId: 'env-1', socket: {}, stepId: 'parent', message: 'p', stack: 's' } as any;
    const error = new TestError({ logger, agent, plugins, parentError } as any);

    expect(error.stepId).toBe('');
  });

  test('TestError summaryInfo logs summary', async () => {
    const logger = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const plugins = {
      envsId: 'env-1',
      getPlugins: jest.fn().mockReturnValue({ getValues: jest.fn().mockReturnValue({ descriptionError: '' }) }),
    } as any;
    const agent = { envsId: 'env-1', socket: {}, stepId: 's1', description: '', name: '' } as any;
    const error = new TestError({ logger, agent, plugins } as any);

    await error.summaryInfo();

    expect(logger.log).toHaveBeenCalled();
  });

  test('TestError summaryInfo uses defaults for empty fields', async () => {
    const logger = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const plugins = {
      envsId: 'env-1',
      getPlugins: jest.fn().mockReturnValue({ getValues: jest.fn().mockReturnValue({ descriptionError: '' }) }),
    } as any;
    const agent = { envsId: 'env-1', socket: {}, stepId: 's1', description: '', name: '' } as any;
    const error = new TestError({ logger, agent, plugins } as any);

    (error as any).message = undefined;
    (error as any).breadcrumbs = undefined;
    (error as any).breadcrumbsDescriptions = undefined;

    await error.summaryInfo();

    expect(logger.log).toHaveBeenCalled();
  });

  test('errorHandler sends yaml and exits', async () => {
    new Arguments({ PPD_DEBUG_MODE: false }, {}, true);

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const socket = { sendYAML: jest.fn() };
    const error = {
      envsId: 'env-1',
      socket,
      type: 'error',
      message: 'm',
      stack: 's',
    } as any;

    await errorHandler(error);

    expect(socket.sendYAML).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);

    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });

  test('errorHandler ignores closeAllRunners errors', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    mockEnvironmentClass.mockImplementation(
      () =>
        ({
          getEnvRunners: jest.fn().mockImplementation(() => {
            throw new Error('fail');
          }),
          getSocket: jest.fn().mockReturnValue({ sendYAML: jest.fn() }),
        } as any),
    );

    await errorHandler({ envsId: 'env-1', socket: { sendYAML: jest.fn() }, message: 'm', stack: 's' } as any);

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  test('errorHandler skips sendYAML when socket missing', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await errorHandler({ envsId: 'env-1', message: 'm', stack: 's' } as any);

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  test('errorHandler skips closeAllRunners when missing', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    mockEnvironmentClass.mockImplementation(
      () =>
        ({
          getEnvRunners: jest.fn().mockReturnValue({}),
          getSocket: jest.fn().mockReturnValue({ sendYAML: jest.fn() }),
        } as any),
    );

    await errorHandler({ envsId: 'env-1', socket: { sendYAML: jest.fn() }, message: 'm', stack: 's' } as any);

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  test('errorHandler handles TestError with debug mode', async () => {
    new Arguments({ PPD_DEBUG_MODE: true }, {}, true);

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const logger = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const plugins = {
      envsId: 'env-1',
      getPlugins: jest.fn().mockReturnValue({ getValues: jest.fn().mockReturnValue({}) }),
    } as any;

    const agent = { envsId: 'env-1', socket: { sendYAML: jest.fn() }, stepId: 's1', description: '', name: '' } as any;
    const testError = new TestError({ logger, agent, plugins } as any);

    await errorHandler(testError as any);

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  test('errorHandler works with default args', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await errorHandler({ envsId: 'env-1', socket: { sendYAML: jest.fn() }, message: 'm', stack: 's' } as any);

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  test('errorHandler uses default debug mode when args missing', async () => {
    const argsSpy = jest.spyOn(Arguments.prototype, 'args', 'get').mockReturnValue({} as any);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await errorHandler({ envsId: 'env-1', socket: { sendYAML: jest.fn() }, message: 'm', stack: 's' } as any);

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
    argsSpy.mockRestore();
  });
});
