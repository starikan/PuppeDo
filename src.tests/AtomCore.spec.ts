import Atom from '../src/AtomCore';
import { Environment } from '../src/Environment';
import { logArgs, logDebug, logError, logExtend, logExtendFileInfo, logTimer } from '../src/Loggers/CustomLogEntries';

jest.mock('../src/Environment');
jest.mock('../src/Loggers/CustomLogEntries');

const mockEnvironmentClass = Environment as jest.MockedClass<typeof Environment>;
const mockLogArgs = logArgs as jest.MockedFunction<typeof logArgs>;
const mockLogDebug = logDebug as jest.MockedFunction<typeof logDebug>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;
const mockLogExtend = logExtend as jest.MockedFunction<typeof logExtend>;
const mockLogExtendFileInfo = logExtendFileInfo as jest.MockedFunction<typeof logExtendFileInfo>;
const mockLogTimer = logTimer as jest.MockedFunction<typeof logTimer>;

const createAtomWithEngine = (engine: string, page: any) => {
  const runner = {
    getRunnerData: jest.fn().mockReturnValue({ browser: { engine } }),
  } as any;
  return new Atom({ runner, page });
};

describe('AtomCore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('atomRun throws by default', async () => {
    await expect(new Atom().atomRun()).rejects.toThrow('Empty Atom Run');
  });

  test('getEngine validates engines', () => {
    const atom = createAtomWithEngine('puppeteer', {});

    expect(atom.getEngine(null)).toBe('puppeteer');
    expect(atom.getEngine('puppeteer')).toBe(true);
    expect(atom.getEngine('playwright')).toBe(false);

    const badAtom = createAtomWithEngine('unknown', {});
    expect(() => badAtom.getEngine(null)).toThrow('There is unknown engine: unknown');
  });

  test('getElement returns elements for puppeteer selectors', async () => {
    const elements = [{ id: 'css-1' }, { id: 'css-2' }];
    const page = {
      $$: jest.fn().mockImplementation((selector: string) => {
        if (selector === '.item') return Promise.resolve(elements);
        if (selector === 'xpath/.//div') return Promise.resolve([{ id: 'xpath' }]);
        if (selector === '//*[text()[contains(.,"Hello")]]') return Promise.resolve([{ id: 'text' }]);
        return Promise.resolve([]);
      }),
    };

    const atom = createAtomWithEngine('puppeteer', page);

    const cssResult = await atom.getElement('css=.item');
    expect(cssResult).toEqual(elements[0]);

    const xpathResult = await atom.getElement('xpath=//div');
    expect(xpathResult).toEqual({ id: 'xpath' });

    const textResult = await atom.getElement('text=Hello');
    expect(textResult).toEqual({ id: 'text' });

    const allResult = await atom.getElement('.item', true);
    expect(allResult).toEqual(elements);
  });

  test('getElement returns elements for playwright selectors', async () => {
    const page = {
      $$: jest.fn().mockImplementation((selector: string) => {
        if (selector === 'css=.item') return Promise.resolve([{ id: 'css' }]);
        if (selector === 'xpath=//div') return Promise.resolve([{ id: 'xpath' }]);
        if (selector === 'text=Hello') return Promise.resolve([{ id: 'text' }]);
        return Promise.resolve([]);
      }),
    };

    const atom = createAtomWithEngine('playwright', page);

    const cssResult = await atom.getElement('css=.item');
    expect(cssResult).toEqual({ id: 'css' });

    const xpathResult = await atom.getElement('xpath=//div');
    expect(xpathResult).toEqual({ id: 'xpath' });

    const textResult = await atom.getElement('text=Hello');
    expect(textResult).toEqual({ id: 'text' });

    const allResult = await atom.getElement('css=.item', true);
    expect(allResult).toEqual([{ id: 'css' }]);
  });

  test('getElement returns false on empty selector', async () => {
    const atom = createAtomWithEngine('puppeteer', { $$: jest.fn() });
    expect(await atom.getElement('')).toBe(false);
    expect(await atom.getElement(null as any)).toBe(false);
  });

  test('updateFrame skips when no frame provided', async () => {
    const page = { $$: jest.fn() };
    const atom = createAtomWithEngine('puppeteer', page);

    mockEnvironmentClass.mockImplementation(
      () =>
        ({
          getEnvInstance: jest.fn().mockReturnValue({
            plugins: {
              getPlugins: jest.fn().mockReturnValue({ getValues: jest.fn().mockReturnValue({ frame: undefined }) }),
            },
          }),
        } as any),
    );

    const initialPage = atom.page;
    await atom.updateFrame({ envsId: 'env-1', stepId: 'step-1' } as any);
    expect(atom.page).toBe(initialPage);
    expect(page.$$).not.toHaveBeenCalled();
  });

  test('updateFrame switches page for puppeteer frame', async () => {
    const frameObj = { frame: true };
    const page = {
      $$: jest.fn().mockResolvedValue([{ contentFrame: jest.fn().mockResolvedValue(frameObj) }]),
    };
    const atom = createAtomWithEngine('puppeteer', page);

    mockEnvironmentClass.mockImplementation(
      () =>
        ({
          getEnvInstance: jest.fn().mockReturnValue({
            plugins: {
              getPlugins: jest.fn().mockReturnValue({ getValues: jest.fn().mockReturnValue({ frame: 'frame1' }) }),
            },
          }),
        } as any),
    );

    await atom.updateFrame({ envsId: 'env-1', stepId: 'step-1' } as any);
    expect(page.$$).toHaveBeenCalledWith('iframe[name="frame1"]');
    expect(atom.page).toBe(frameObj);
  });

  test('updateFrame switches page for playwright frame', async () => {
    const frameObj = { frame: true };
    const page = {
      $$: jest.fn().mockResolvedValue([{ contentFrame: jest.fn().mockResolvedValue(frameObj) }]),
    };
    const atom = createAtomWithEngine('playwright', page);

    mockEnvironmentClass.mockImplementation(
      () =>
        ({
          getEnvInstance: jest.fn().mockReturnValue({
            plugins: {
              getPlugins: jest.fn().mockReturnValue({ getValues: jest.fn().mockReturnValue({ frame: 'frame2' }) }),
            },
          }),
        } as any),
    );

    await atom.updateFrame({ envsId: 'env-2', stepId: 'step-2' } as any);
    expect(page.$$).toHaveBeenCalledWith('iframe[name="frame2"]');
    expect(atom.page).toBe(frameObj);
  });

  test('updateFrame does not change page when iframe not found', async () => {
    const page = {
      $$: jest.fn().mockResolvedValue([]),
    };
    const atom = createAtomWithEngine('puppeteer', page);

    mockEnvironmentClass.mockImplementation(
      () =>
        ({
          getEnvInstance: jest.fn().mockReturnValue({
            plugins: {
              getPlugins: jest.fn().mockReturnValue({ getValues: jest.fn().mockReturnValue({ frame: 'frameX' }) }),
            },
          }),
        } as any),
    );

    const initialPage = atom.page;
    await atom.updateFrame({ envsId: 'env-1', stepId: 'step-1' } as any);

    expect(page.$$).toHaveBeenCalledWith('iframe[name="frameX"]');
    expect(atom.page).toBe(initialPage);
  });

  test('updateFrame keeps page when elementHandle is undefined', async () => {
    const page = {
      $$: jest.fn().mockResolvedValue(undefined),
    };
    const atom = createAtomWithEngine('puppeteer', page);

    mockEnvironmentClass.mockImplementation(
      () =>
        ({
          getEnvInstance: jest.fn().mockReturnValue({
            plugins: {
              getPlugins: jest.fn().mockReturnValue({ getValues: jest.fn().mockReturnValue({ frame: 'frameY' }) }),
            },
          }),
        } as any),
    );

    const initialPage = atom.page;
    await atom.updateFrame({ envsId: 'env-1', stepId: 'step-1' } as any);

    expect(page.$$).toHaveBeenCalledWith('iframe[name="frameY"]');
    expect(atom.page).toBe(initialPage);
  });

  test('runAtom executes atomRun and logs', async () => {
    const page = { $$: jest.fn() };
    const atom = createAtomWithEngine('puppeteer', page);

    (atom as any).updateFrame = jest.fn().mockResolvedValue(undefined);
    atom.atomRun = jest.fn().mockResolvedValue({ ok: true });

    const log = jest.fn().mockResolvedValue(undefined);
    const args = {
      foo: 'bar',
      agent: {
        data: { data: true },
        bindData: { bind: true },
        selectors: { s: 1 },
        bindSelectors: { bs: 1 },
        bindResults: { br: 1 },
        options: { opt: true },
        levelIndent: 1,
        envsId: 'env-1',
        stepId: 'step-1',
        breadcrumbs: ['root'],
      },
      log,
      logOptions: { screenshot: true },
    } as any;

    const result = await atom.runAtom(args);

    expect(result).toEqual({ ok: true });
    expect(atom.atomRun).toHaveBeenCalledTimes(1);
    expect((atom as any).foo).toBe('bar');
    expect(mockLogExtend).toHaveBeenCalled();
    expect(mockLogTimer).toHaveBeenCalled();

    await atom.log({
      level: 'error',
      text: 'fail',
      logOptions: { fullpage: true },
      logMeta: { extra: true },
    } as any);

    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error',
        logOptions: expect.objectContaining({ fullpage: true, logThis: true }),
        logMeta: { extra: true },
        levelIndent: 2,
        text: 'fail',
      }),
    );

    await atom.log({
      level: 'info',
      text: 'ok',
      logOptions: { logThis: false },
    } as any);

    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        logOptions: expect.objectContaining({ logThis: false }),
        logMeta: { breadcrumbs: ['root'] },
        levelIndent: 2,
        text: 'ok',
      }),
    );
  });

  test('runAtom logs errors and throws AtomError', async () => {
    const page = { $$: jest.fn() };
    const atom = createAtomWithEngine('puppeteer', page);

    (atom as any).updateFrame = jest.fn().mockResolvedValue(undefined);
    atom.atomRun = jest.fn().mockRejectedValue(new Error('boom'));

    const log = jest.fn().mockResolvedValue(undefined);
    const args = {
      agent: {
        data: {},
        bindData: {},
        selectors: {},
        bindSelectors: {},
        bindResults: {},
        options: {},
        levelIndent: 0,
        envsId: 'env-1',
        stepId: 'step-1',
        breadcrumbs: [],
      },
      log,
    } as any;

    await expect(atom.runAtom(args)).rejects.toThrow('Error in Atom');

    expect(mockLogError).toHaveBeenCalled();
    expect(mockLogExtend).toHaveBeenCalledWith(expect.any(Function), expect.any(Object), true);
    expect(mockLogArgs).toHaveBeenCalled();
    expect(mockLogDebug).toHaveBeenCalled();
    expect(mockLogExtendFileInfo).toHaveBeenCalled();
  });

  test('runAtom default log options and breadcrumbs fallback', async () => {
    const page = { $$: jest.fn() };
    const atom = createAtomWithEngine('puppeteer', page);

    (atom as any).updateFrame = jest.fn().mockResolvedValue(undefined);
    atom.atomRun = jest.fn().mockResolvedValue({ ok: true });

    const log = jest.fn().mockResolvedValue(undefined);
    const args = {
      agent: {
        data: {},
        bindData: {},
        selectors: {},
        bindSelectors: {},
        bindResults: {},
        options: {},
        levelIndent: undefined,
        envsId: 'env-1',
        stepId: 'step-1',
        breadcrumbs: undefined,
      },
      log,
    } as any;

    await atom.runAtom(args);

    await atom.log({ level: 'info', text: 'ok' } as any);

    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        logOptions: { screenshot: false, fullpage: false },
        logMeta: { breadcrumbs: [] },
        levelIndent: 1,
        text: 'ok',
      }),
    );
  });

  test('runAtom skips arg assignment when Object.hasOwn is false', async () => {
    const page = { $$: jest.fn() };
    const atom = createAtomWithEngine('puppeteer', page);

    (atom as any).updateFrame = jest.fn().mockResolvedValue(undefined);
    atom.atomRun = jest.fn().mockResolvedValue({ ok: true });

    const log = jest.fn().mockResolvedValue(undefined);
    const args = {
      foo: 'bar',
      agent: {
        data: {},
        bindData: {},
        selectors: {},
        bindSelectors: {},
        bindResults: {},
        options: {},
        levelIndent: 0,
        envsId: 'env-1',
        stepId: 'step-1',
        breadcrumbs: [],
      },
      log,
    } as any;

    const hasOwnSpy = jest.spyOn(Object, 'hasOwn').mockReturnValue(false);

    await atom.runAtom(args);

    expect((atom as any).foo).toBeUndefined();

    hasOwnSpy.mockRestore();
  });

  test('runAtom handles falsy args branch in logger setup', async () => {
    const page = { $$: jest.fn() };
    const atom = createAtomWithEngine('puppeteer', page);

    (atom as any).updateFrame = jest.fn().mockResolvedValue(undefined);
    atom.atomRun = jest.fn().mockResolvedValue({ ok: true });

    const originalAgent = (Number.prototype as any).agent;
    const originalLog = (Number.prototype as any).log;

    (Number.prototype as any).agent = {
      data: {},
      bindData: {},
      selectors: {},
      bindSelectors: {},
      bindResults: {},
      options: {},
      levelIndent: undefined,
      envsId: 'env-1',
      stepId: 'step-1',
      breadcrumbs: [],
    };
    (Number.prototype as any).log = jest.fn();

    const result = await atom.runAtom(0 as any);

    await atom.log({ level: 'info', text: 'skip' } as any);

    expect(result).toEqual({ ok: true });
    expect((Number.prototype as any).log).not.toHaveBeenCalled();

    (Number.prototype as any).agent = originalAgent;
    (Number.prototype as any).log = originalLog;
  });
});
