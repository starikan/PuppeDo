import { spawn } from 'child_process';
import { Arguments } from '../src/Arguments';
import { Engines, DEFAULT_BROWSER } from '../src/Engines';
import { Environment } from '../src/Environment';
import { sleep } from '../src/Helpers';

jest.mock('child_process', () => ({ spawn: jest.fn() }));
jest.mock('../src/Environment');
jest.mock('../src/Helpers', () => ({
  ...jest.requireActual('../src/Helpers'),
  sleep: jest.fn().mockResolvedValue(undefined),
}));

const mockEnvironmentClass = Environment as jest.MockedClass<typeof Environment>;
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;
const mockSleep = sleep as jest.MockedFunction<typeof sleep>;

describe('Engines', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__non_webpack_require__ = jest.fn();
    (global as any).fetch = undefined;

    mockEnvironmentClass.mockImplementation(
      () =>
        ({
          getLogger: jest.fn().mockReturnValue({
            exporter: {
              saveToFile: jest.fn(),
              appendToFile: jest.fn(),
            },
          }),
        } as any),
    );
  });

  test('resolveBrowser validates options', () => {
    expect(() => Engines.resolveBrowser({ ...DEFAULT_BROWSER, type: 'unknown' as any })).toThrow(
      `PuppeDo can't find this type of envitonment: "unknown". Allow this types: browser,electron`,
    );
    expect(() => Engines.resolveBrowser({ ...DEFAULT_BROWSER, engine: 'unknown' as any })).toThrow(
      `PuppeDo can't find engine: "unknown". Allow this engines: puppeteer,playwright`,
    );
    expect(() => Engines.resolveBrowser({ ...DEFAULT_BROWSER, browserName: 'opera' as any })).toThrow(
      `PuppeDo can't find this type of browser: "opera". Allow this types: chrome,chromium,firefox,webkit`,
    );
    expect(() =>
      Engines.resolveBrowser({ ...DEFAULT_BROWSER, engine: 'playwright', browserName: 'chrome' as any }),
    ).toThrow("Playwright supports only browsers: 'chromium', 'firefox', 'webkit'");
    expect(() =>
      Engines.resolveBrowser({ ...DEFAULT_BROWSER, engine: 'puppeteer', browserName: 'webkit' as any }),
    ).toThrow("Puppeteer supports only browsers: 'chrome', 'firefox'");
    expect(() => Engines.resolveBrowser({ ...DEFAULT_BROWSER, runtime: 'attach' as any })).toThrow(
      'PuppeDo can run or connect to browser only',
    );
    expect(() => Engines.resolveBrowser({ ...DEFAULT_BROWSER, runtime: 'connect', type: 'browser' })).toThrow(
      "PuppeDo can't connect to browser yet",
    );

    const resolved = Engines.resolveBrowser({ ...DEFAULT_BROWSER, engine: 'puppeteer', browserName: 'chrome' as any });
    expect(resolved.engine).toBe('puppeteer');
  });

  test('resolveBrowser uses defaults when input is undefined', () => {
    const resolved = Engines.resolveBrowser(undefined as any);
    expect(resolved.engine).toBe(DEFAULT_BROWSER.engine);
    expect(resolved.browserName).toBe(DEFAULT_BROWSER.browserName);
  });

  test('resolveBrowser accepts electron connect runtime', () => {
    const resolved = Engines.resolveBrowser({
      type: 'electron',
      engine: 'playwright',
      runtime: 'connect',
      browserName: 'chromium',
    } as any);

    expect(resolved.type).toBe('electron');
    expect(resolved.runtime).toBe('connect');
  });

  test('runElectron throws when runtimeExecutable missing', async () => {
    await expect(
      Engines.runElectron(
        {
          type: 'electron',
          engine: 'puppeteer',
          runtimeEnv: {},
        } as any,
        'envName',
        'envId',
      ),
    ).rejects.toThrow("Can't run Electron undefined");
  });

  test('runElectron uses default runtimeEnv when missing', async () => {
    await expect(
      Engines.runElectron(
        {
          type: 'electron',
          engine: 'puppeteer',
        } as any,
        'envName',
        'envId',
      ),
    ).rejects.toThrow("Can't run Electron undefined");
  });

  test('connectElectron throws when settings missing', async () => {
    await expect(Engines.connectElectron(undefined as any)).rejects.toThrow("Can't connect to Electron");
  });

  test('runPuppeteer uses defaults when settings omitted', async () => {
    new Arguments({ PPD_DEBUG_MODE: false }, {}, true);

    const page = { id: 'page' } as any;
    const browser = { pages: jest.fn().mockResolvedValue([page]) } as any;
    const launch = jest.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = jest.fn().mockReturnValue({ launch });

    await Engines.runPuppeteer(
      {
        name: 'runner',
        type: 'runner',
        browser: {
          engine: 'puppeteer',
        },
      } as any,
      {},
    );

    expect(launch).toHaveBeenCalledWith(expect.objectContaining({ devtools: false, product: 'chrome' }));
  });

  test('runPlaywright uses default debug mode when args missing', async () => {
    const argsSpy = jest.spyOn(Arguments.prototype, 'args', 'get').mockReturnValue({} as any);
    const launch = jest.fn().mockResolvedValue({});
    (global as any).__non_webpack_require__ = jest
      .fn()
      .mockReturnValue({ chromium: { launch }, firefox: { launch }, webkit: { launch } });

    const addPageSpy = jest.spyOn(Engines, 'addPage').mockResolvedValue({ pages: { main: { id: 1 } } } as any);

    await Engines.runPlaywright(
      {
        name: 'runner',
        type: 'runner',
        browser: {
          engine: 'playwright',
          browserName: 'chromium',
        },
      } as any,
      {},
    );

    expect(launch).toHaveBeenCalledWith(expect.objectContaining({ devtools: false }));

    addPageSpy.mockRestore();
    argsSpy.mockRestore();
  });

  test('runPuppeteer uses default debug mode when args missing', async () => {
    const argsSpy = jest.spyOn(Arguments.prototype, 'args', 'get').mockReturnValue({} as any);

    const page = { id: 'page' } as any;
    const browser = { pages: jest.fn().mockResolvedValue([page]) } as any;
    const launch = jest.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = jest.fn().mockReturnValue({ launch });

    await Engines.runPuppeteer(
      {
        name: 'runner',
        type: 'runner',
        browser: {
          engine: 'puppeteer',
        },
      } as any,
      {},
    );

    expect(launch).toHaveBeenCalledWith(expect.objectContaining({ devtools: false }));

    argsSpy.mockRestore();
  });

  test('resolveBrowser accepts playwright chromium', () => {
    const resolved = Engines.resolveBrowser({
      ...DEFAULT_BROWSER,
      engine: 'playwright',
      browserName: 'chromium',
    } as any);

    expect(resolved.engine).toBe('playwright');
  });

  test('resolveBrowser rejects invalid engine for electron', () => {
    expect(() =>
      Engines.resolveBrowser({
        type: 'electron',
        engine: 'invalid' as any,
        runtime: 'run',
        browserName: 'chromium',
      } as any),
    ).toThrow(`PuppeDo can't find engine: "invalid". Allow this engines: puppeteer,playwright`);
  });

  test('runPuppeteer launches and returns pages', async () => {
    new Arguments({ PPD_DEBUG_MODE: true }, {}, true);

    const page = { id: 'page' } as any;
    const browser = { pages: jest.fn().mockResolvedValue([page]) } as any;
    const launch = jest.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = jest.fn().mockReturnValue({ launch });

    const state = await Engines.runPuppeteer(
      {
        name: 'runner',
        type: 'runner',
        browser: {
          engine: 'puppeteer',
          browserName: 'chrome',
          headless: true,
          slowMo: 0,
          args: [],
          windowSize: { width: 800, height: 600 },
          executablePath: '',
          timeout: 10,
        },
      } as any,
      {},
    );

    expect(launch).toHaveBeenCalledWith(expect.objectContaining({ devtools: true }));
    expect(state.pages?.main).toBe(page);
  });

  test('connectPuppeteer connects and sets viewport', async () => {
    const page = { setViewport: jest.fn() } as any;
    const browser = { pages: jest.fn().mockResolvedValue([page]) } as any;
    const connect = jest.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = jest.fn().mockReturnValue({ connect });

    const result = await Engines.connectPuppeteer('ws://debug', 0, { width: 100, height: 200 }, 1000);
    expect(result.pages.main).toBe(page);
    expect(page.setViewport).toHaveBeenCalledWith({ width: 100, height: 200 });
  });

  test('connectPuppeteer throws when no pages', async () => {
    const browser = { pages: jest.fn().mockResolvedValue([]) } as any;
    const connect = jest.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = jest.fn().mockReturnValue({ connect });

    await expect(Engines.connectPuppeteer('ws://debug', 0, {}, 1000)).rejects.toThrow(
      'Can`t find any pages in connection',
    );
  });

  test('runPlaywright launches and adds page', async () => {
    new Arguments({ PPD_DEBUG_MODE: true }, {}, true);
    const launch = jest.fn().mockResolvedValue({});
    (global as any).__non_webpack_require__ = jest
      .fn()
      .mockReturnValue({ chromium: { launch }, firefox: { launch }, webkit: { launch } });

    const addPageSpy = jest.spyOn(Engines, 'addPage').mockResolvedValue({ pages: { main: { id: 1 } } } as any);

    const state = await Engines.runPlaywright(
      {
        name: 'runner',
        type: 'runner',
        browser: {
          engine: 'playwright',
          browserName: 'chromium',
          headless: true,
          slowMo: 0,
          args: [],
          windowSize: { width: 800, height: 600 },
          executablePath: '',
          timeout: 10,
        },
      } as any,
      {},
    );

    expect(launch).toHaveBeenCalledWith(expect.objectContaining({ devtools: true }));
    expect(addPageSpy).toHaveBeenCalled();
    expect(state.pages?.main).toBeDefined();

    addPageSpy.mockRestore();
  });

  test('runPlaywright does not set devtools for non-chromium', async () => {
    new Arguments({ PPD_DEBUG_MODE: true }, {}, true);
    const launch = jest.fn().mockResolvedValue({});
    (global as any).__non_webpack_require__ = jest
      .fn()
      .mockReturnValue({ chromium: { launch }, firefox: { launch }, webkit: { launch } });

    const addPageSpy = jest.spyOn(Engines, 'addPage').mockResolvedValue({ pages: { main: { id: 1 } } } as any);

    await Engines.runPlaywright(
      {
        name: 'runner',
        type: 'runner',
        browser: {
          engine: 'playwright',
          browserName: 'firefox',
        },
      } as any,
      {},
    );

    expect(launch).toHaveBeenCalledWith(expect.not.objectContaining({ devtools: true }));

    addPageSpy.mockRestore();
  });

  test('runPlaywright uses defaults when browser settings missing', async () => {
    new Arguments({ PPD_DEBUG_MODE: false }, {}, true);
    const launch = jest.fn().mockResolvedValue({});
    (global as any).__non_webpack_require__ = jest
      .fn()
      .mockReturnValue({ chromium: { launch }, firefox: { launch }, webkit: { launch } });

    const addPageSpy = jest.spyOn(Engines, 'addPage').mockResolvedValue({ pages: { main: { id: 1 } } } as any);

    const state = await Engines.runPlaywright({ name: 'runner', type: 'runner' } as any, {});

    expect(launch).toHaveBeenCalled();
    expect(state.pages?.main).toBeDefined();

    addPageSpy.mockRestore();
  });

  test('connectPlaywright connects and sets viewport', async () => {
    const page = { setViewportSize: jest.fn() } as any;
    const contexts = { pages: jest.fn().mockResolvedValue([page]) };
    const browser = { contexts: jest.fn().mockResolvedValue(contexts) } as any;
    const connect = jest.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = jest
      .fn()
      .mockReturnValue({ chromium: { connect }, firefox: { connect }, webkit: { connect } });

    const result = await Engines.connectPlaywright('ws://debug', 0, { width: 120, height: 240 }, 1000, 'chromium');
    expect(result.pages.main).toBe(page);
    expect(page.setViewportSize).toHaveBeenCalledWith({ width: 120, height: 240 });
  });

  test('connectPlaywright skips viewport when size missing', async () => {
    const page = { setViewportSize: jest.fn() } as any;
    const contexts = { pages: jest.fn().mockResolvedValue([page]) };
    const browser = { contexts: jest.fn().mockResolvedValue(contexts) } as any;
    const connect = jest.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = jest
      .fn()
      .mockReturnValue({ chromium: { connect }, firefox: { connect }, webkit: { connect } });

    const result = await Engines.connectPlaywright('ws://debug', 0, {}, 1000, 'chromium');
    expect(result.pages.main).toBe(page);
    expect(page.setViewportSize).not.toHaveBeenCalled();
  });

  test('connectPlaywright throws when no pages', async () => {
    const contexts = { pages: jest.fn().mockResolvedValue([]) };
    const browser = { contexts: jest.fn().mockResolvedValue(contexts) } as any;
    const connect = jest.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = jest
      .fn()
      .mockReturnValue({ chromium: { connect }, firefox: { connect }, webkit: { connect } });

    await expect(Engines.connectPlaywright('ws://debug', 0, {}, 1000, 'chromium')).rejects.toThrow(
      'Can`t find any pages in connection',
    );
  });

  test('connectElectron handles errors and engines', async () => {
    await expect(Engines.connectElectron({} as any)).rejects.toThrow("Can't connect to Electron");

    (global as any).fetch = jest.fn().mockImplementation(async () => ({
      ok: false,
      statusText: 'bad',
      json: jest.fn(),
    }));

    await expect(Engines.connectElectron({ urlDevtoolsJson: 'http://x/' } as any)).rejects.toThrow(
      'Failed to fetch pages JSON: bad',
    );

    (global as any).fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.endsWith('json')) {
        return { ok: true, json: jest.fn().mockResolvedValue([]) };
      }
      return { ok: false, statusText: 'version-bad', json: jest.fn() };
    });

    await expect(Engines.connectElectron({ urlDevtoolsJson: 'http://x/' } as any)).rejects.toThrow(
      'Failed to fetch browser version JSON: version-bad',
    );

    (global as any).fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.endsWith('json')) {
        return { ok: true, json: jest.fn().mockResolvedValue(null) };
      }
      return { ok: true, json: jest.fn().mockResolvedValue(null) };
    });

    await expect(Engines.connectElectron({ urlDevtoolsJson: 'http://x/' } as any)).rejects.toThrow(
      "Can't connect to http://x/",
    );

    (global as any).fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.endsWith('json')) {
        return { ok: true, json: jest.fn().mockResolvedValue([]) };
      }
      return { ok: true, json: jest.fn().mockResolvedValue({}) };
    });

    await expect(Engines.connectElectron({ urlDevtoolsJson: 'http://x/' } as any)).rejects.toThrow(
      'webSocketDebuggerUrl empty. Possibly wrong Electron version running',
    );

    (global as any).fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.endsWith('json')) {
        return { ok: true, json: jest.fn().mockResolvedValue([]) };
      }
      return { ok: true, json: jest.fn().mockResolvedValue({ webSocketDebuggerUrl: 'ws://debug' }) };
    });

    const puppeteerSpy = jest
      .spyOn(Engines, 'connectPuppeteer')
      .mockResolvedValue({ browser: {} as any, pages: { main: {} as any } });

    const resultPuppeteer = await Engines.connectElectron({
      urlDevtoolsJson: 'http://x/',
      engine: 'puppeteer',
      browserName: 'chrome',
      slowMo: 0,
      windowSize: { width: 1, height: 2 },
      timeout: 10,
    } as any);

    expect(resultPuppeteer.pages.main).toBeDefined();
    expect(puppeteerSpy).toHaveBeenCalled();

    const playwrightSpy = jest
      .spyOn(Engines, 'connectPlaywright')
      .mockResolvedValue({ browser: {} as any, pages: { main: {} as any } });

    const resultPlaywright = await Engines.connectElectron({
      urlDevtoolsJson: 'http://x/',
      engine: 'playwright',
      browserName: 'chromium',
      slowMo: 0,
      windowSize: { width: 1, height: 2 },
      timeout: 10,
    } as any);

    expect(resultPlaywright.pages.main).toBeDefined();
    expect(playwrightSpy).toHaveBeenCalled();

    puppeteerSpy.mockRestore();
    playwrightSpy.mockRestore();

    await expect(
      Engines.connectElectron({ urlDevtoolsJson: 'http://x/', engine: 'unknown' as any } as any),
    ).rejects.toThrow('Can`t find any supported browser engine in environment');
  });

  test('runElectron runs and connects', async () => {
    const stdout = {
      on: jest.fn().mockImplementation((event: string, cb: (data: string) => void) => {
        if (event === 'data') {
          cb('log-data');
        }
      }),
    };
    mockSpawn.mockReturnValue({ pid: 123, stdout } as any);

    const connectSpy = jest
      .spyOn(Engines, 'connectElectron')
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue({ browser: {} as any, pages: { main: {} as any } });

    const result = await Engines.runElectron(
      {
        type: 'electron',
        engine: 'puppeteer',
        runtimeEnv: {
          runtimeExecutable: 'electron',
          program: 'app',
          cwd: '.',
          args: ['--test'],
          env: { TEST: '1' },
          secondsToStartApp: 2,
          secondsDelayAfterStartApp: 0,
        },
      } as any,
      'envName',
      'envId',
    );

    expect(connectSpy).toHaveBeenCalled();
    expect(result.pid).toBe(123);
    expect(mockSleep).toHaveBeenCalled();
  });

  test('runElectron handles missing process object', async () => {
    mockSpawn.mockReturnValue(undefined as any);

    await expect(
      Engines.runElectron(
        {
          type: 'electron',
          engine: 'puppeteer',
          runtimeEnv: { runtimeExecutable: 'electron', secondsToStartApp: 0 },
        } as any,
        'envName',
        'envId',
      ),
    ).rejects.toThrow("Can't run Electron electron");
  });

  test('runElectron throws when runtimeExecutable missing', async () => {
    await expect(
      Engines.runElectron(
        {
          type: 'electron',
          engine: 'puppeteer',
          runtimeEnv: {},
        } as any,
        'envName',
        'envId',
      ),
    ).rejects.toThrow("Can't run Electron undefined");
  });

  test('addPage adds page based on engine', async () => {
    const puppeteerPage = { setViewport: jest.fn() } as any;
    const playwrightPage = { id: 'pw' } as any;

    const puppeteerBrowser = { newPage: jest.fn().mockResolvedValue(puppeteerPage) } as any;
    const playwrightBrowser = { newPage: jest.fn().mockResolvedValue(playwrightPage) } as any;

    const statePuppeteer = await Engines.addPage(
      { browser: puppeteerBrowser, pages: {} } as any,
      { browser: { engine: 'puppeteer' } } as any,
      { width: 100, height: 200 },
      'main',
    );

    const statePlaywright = await Engines.addPage(
      { browser: playwrightBrowser, pages: {} } as any,
      { browser: { engine: 'playwright' } } as any,
      { width: 100, height: 200 },
      'main',
    );

    expect(statePuppeteer.pages.main).toBe(puppeteerPage);
    expect(statePlaywright.pages.main).toBe(playwrightPage);

    await expect(
      Engines.addPage({ browser: {} as any, pages: {} } as any, { browser: { engine: 'unknown' } } as any),
    ).rejects.toThrow('Cant add new page');
  });

  test('runPuppeteer uses default viewport when windowSize missing', async () => {
    new Arguments({ PPD_DEBUG_MODE: false }, {}, true);

    const page = { id: 'page' } as any;
    const browser = { pages: jest.fn().mockResolvedValue([page]) } as any;
    const launch = jest.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = jest.fn().mockReturnValue({ launch });

    const state = await Engines.runPuppeteer(
      {
        name: 'runner',
        type: 'runner',
        browser: {
          engine: 'puppeteer',
          browserName: 'chrome',
        },
      } as any,
      {},
    );

    expect(launch).toHaveBeenCalledWith(expect.objectContaining({ devtools: false }));
    expect(state.pages?.main).toBe(page);
  });

  test('runPuppeteer uses default settings when browser config missing', async () => {
    new Arguments({ PPD_DEBUG_MODE: false }, {}, true);

    const page = { id: 'page' } as any;
    const browser = { pages: jest.fn().mockResolvedValue([page]) } as any;
    const launch = jest.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = jest.fn().mockReturnValue({ launch });

    const state = await Engines.runPuppeteer({ name: 'runner', type: 'runner', browser: {} } as any, {});

    expect(launch).toHaveBeenCalled();
    expect(state.pages?.main).toBe(page);
  });

  test('connectPuppeteer skips viewport when size missing', async () => {
    const page = { setViewport: jest.fn() } as any;
    const browser = { pages: jest.fn().mockResolvedValue([page]) } as any;
    const connect = jest.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = jest.fn().mockReturnValue({ connect });

    const result = await Engines.connectPuppeteer('ws://debug', 0, { width: 0, height: 0 }, 1000);
    expect(result.pages.main).toBe(page);
    expect(page.setViewport).not.toHaveBeenCalled();
  });

  test('addPage does not set viewport when size missing', async () => {
    const puppeteerPage = { setViewport: jest.fn() } as any;
    const puppeteerBrowser = { newPage: jest.fn().mockResolvedValue(puppeteerPage) } as any;

    const state = await Engines.addPage(
      { browser: puppeteerBrowser, pages: {} } as any,
      { browser: { engine: 'puppeteer' } } as any,
      { width: 0, height: 0 },
    );

    expect(state.pages.main).toBe(puppeteerPage);
    expect(puppeteerPage.setViewport).not.toHaveBeenCalled();
  });
});
