import type { MockedClass, MockedFunction } from 'vitest';
import { spawn } from 'child_process';
import { Arguments } from '../src/Arguments';
import { Engines, DEFAULT_BROWSER } from '../src/Engines';
import { Environment } from '../src/Environment';
import { sleep } from '../src/Helpers';

vi.mock('child_process', () => ({ spawn: vi.fn() }));
vi.mock('../src/Environment');
vi.mock('../src/Helpers', async () => ({
  ...(await vi.importActual<typeof import('../src/Helpers')>('../src/Helpers')),
  sleep: vi.fn().mockResolvedValue(undefined),
}));

const mockEnvironmentClass = Environment as MockedClass<typeof Environment>;
const mockSpawn = spawn as MockedFunction<typeof spawn>;
const mockSleep = sleep as MockedFunction<typeof sleep>;

describe('Engines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).__non_webpack_require__ = vi.fn();
    (global as any).fetch = undefined;

    mockEnvironmentClass.mockImplementation(function () {
      return {
        getLogger: vi.fn().mockReturnValue({
          exporter: {
            saveToFile: vi.fn(),
            appendToFile: vi.fn(),
          },
        }),
      } as any;
    });
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
    const browser = { pages: vi.fn().mockResolvedValue([page]) } as any;
    const launch = vi.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = vi.fn().mockReturnValue({ launch });

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
    const argsSpy = vi.spyOn(Arguments.prototype, 'args', 'get').mockReturnValue({} as any);
    const launch = vi.fn().mockResolvedValue({});
    (global as any).__non_webpack_require__ = vi
      .fn()
      .mockReturnValue({ chromium: { launch }, firefox: { launch }, webkit: { launch } });

    const addPageSpy = vi.spyOn(Engines, 'addPage').mockResolvedValue({ pages: { main: { id: 1 } } } as any);

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
    const argsSpy = vi.spyOn(Arguments.prototype, 'args', 'get').mockReturnValue({} as any);

    const page = { id: 'page' } as any;
    const browser = { pages: vi.fn().mockResolvedValue([page]) } as any;
    const launch = vi.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = vi.fn().mockReturnValue({ launch });

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
    const browser = { pages: vi.fn().mockResolvedValue([page]) } as any;
    const launch = vi.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = vi.fn().mockReturnValue({ launch });

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
    const page = { setViewport: vi.fn() } as any;
    const browser = { pages: vi.fn().mockResolvedValue([page]) } as any;
    const connect = vi.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = vi.fn().mockReturnValue({ connect });

    const result = await Engines.connectPuppeteer('ws://debug', 0, { width: 100, height: 200 }, 1000);
    expect(result.pages.main).toBe(page);
    expect(page.setViewport).toHaveBeenCalledWith({ width: 100, height: 200 });
  });

  test('connectPuppeteer throws when no pages', async () => {
    const browser = { pages: vi.fn().mockResolvedValue([]) } as any;
    const connect = vi.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = vi.fn().mockReturnValue({ connect });

    await expect(Engines.connectPuppeteer('ws://debug', 0, {}, 1000)).rejects.toThrow(
      'Can`t find any pages in connection',
    );
  });

  test('runPlaywright launches and adds page', async () => {
    new Arguments({ PPD_DEBUG_MODE: true }, {}, true);
    const launch = vi.fn().mockResolvedValue({});
    (global as any).__non_webpack_require__ = vi
      .fn()
      .mockReturnValue({ chromium: { launch }, firefox: { launch }, webkit: { launch } });

    const addPageSpy = vi.spyOn(Engines, 'addPage').mockResolvedValue({ pages: { main: { id: 1 } } } as any);

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
    const launch = vi.fn().mockResolvedValue({});
    (global as any).__non_webpack_require__ = vi
      .fn()
      .mockReturnValue({ chromium: { launch }, firefox: { launch }, webkit: { launch } });

    const addPageSpy = vi.spyOn(Engines, 'addPage').mockResolvedValue({ pages: { main: { id: 1 } } } as any);

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
    const launch = vi.fn().mockResolvedValue({});
    (global as any).__non_webpack_require__ = vi
      .fn()
      .mockReturnValue({ chromium: { launch }, firefox: { launch }, webkit: { launch } });

    const addPageSpy = vi.spyOn(Engines, 'addPage').mockResolvedValue({ pages: { main: { id: 1 } } } as any);

    const state = await Engines.runPlaywright({ name: 'runner', type: 'runner' } as any, {});

    expect(launch).toHaveBeenCalled();
    expect(state.pages?.main).toBeDefined();

    addPageSpy.mockRestore();
  });

  test('connectPlaywright connects and sets viewport', async () => {
    const page = { setViewportSize: vi.fn() } as any;
    const contexts = { pages: vi.fn().mockResolvedValue([page]) };
    const browser = { contexts: vi.fn().mockResolvedValue(contexts) } as any;
    const connect = vi.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = vi
      .fn()
      .mockReturnValue({ chromium: { connect }, firefox: { connect }, webkit: { connect } });

    const result = await Engines.connectPlaywright('ws://debug', 0, { width: 120, height: 240 }, 1000, 'chromium');
    expect(result.pages.main).toBe(page);
    expect(page.setViewportSize).toHaveBeenCalledWith({ width: 120, height: 240 });
  });

  test('connectPlaywright skips viewport when size missing', async () => {
    const page = { setViewportSize: vi.fn() } as any;
    const contexts = { pages: vi.fn().mockResolvedValue([page]) };
    const browser = { contexts: vi.fn().mockResolvedValue(contexts) } as any;
    const connect = vi.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = vi
      .fn()
      .mockReturnValue({ chromium: { connect }, firefox: { connect }, webkit: { connect } });

    const result = await Engines.connectPlaywright('ws://debug', 0, {}, 1000, 'chromium');
    expect(result.pages.main).toBe(page);
    expect(page.setViewportSize).not.toHaveBeenCalled();
  });

  test('connectPlaywright throws when no pages', async () => {
    const contexts = { pages: vi.fn().mockResolvedValue([]) };
    const browser = { contexts: vi.fn().mockResolvedValue(contexts) } as any;
    const connect = vi.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = vi
      .fn()
      .mockReturnValue({ chromium: { connect }, firefox: { connect }, webkit: { connect } });

    await expect(Engines.connectPlaywright('ws://debug', 0, {}, 1000, 'chromium')).rejects.toThrow(
      'Can`t find any pages in connection',
    );
  });

  test('connectElectron handles errors and engines', async () => {
    await expect(Engines.connectElectron({} as any)).rejects.toThrow("Can't connect to Electron");

    (global as any).fetch = vi.fn().mockImplementation(async () => ({
      ok: false,
      statusText: 'bad',
      json: vi.fn(),
    }));

    await expect(Engines.connectElectron({ urlDevtoolsJson: 'http://x/' } as any)).rejects.toThrow(
      'Failed to fetch pages JSON: bad',
    );

    (global as any).fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith('json')) {
        return { ok: true, json: vi.fn().mockResolvedValue([]) };
      }
      return { ok: false, statusText: 'version-bad', json: vi.fn() };
    });

    await expect(Engines.connectElectron({ urlDevtoolsJson: 'http://x/' } as any)).rejects.toThrow(
      'Failed to fetch browser version JSON: version-bad',
    );

    (global as any).fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith('json')) {
        return { ok: true, json: vi.fn().mockResolvedValue(null) };
      }
      return { ok: true, json: vi.fn().mockResolvedValue(null) };
    });

    await expect(Engines.connectElectron({ urlDevtoolsJson: 'http://x/' } as any)).rejects.toThrow(
      "Can't connect to http://x/",
    );

    (global as any).fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith('json')) {
        return { ok: true, json: vi.fn().mockResolvedValue([]) };
      }
      return { ok: true, json: vi.fn().mockResolvedValue({}) };
    });

    await expect(Engines.connectElectron({ urlDevtoolsJson: 'http://x/' } as any)).rejects.toThrow(
      'webSocketDebuggerUrl empty. Possibly wrong Electron version running',
    );

    (global as any).fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith('json')) {
        return { ok: true, json: vi.fn().mockResolvedValue([]) };
      }
      return { ok: true, json: vi.fn().mockResolvedValue({ webSocketDebuggerUrl: 'ws://debug' }) };
    });

    const puppeteerSpy = vi
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

    const playwrightSpy = vi
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
      on: vi.fn().mockImplementation((event: string, cb: (data: string) => void) => {
        if (event === 'data') {
          cb('log-data');
        }
      }),
    };
    mockSpawn.mockReturnValue({ pid: 123, stdout } as any);

    const connectSpy = vi
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
    const puppeteerPage = { setViewport: vi.fn() } as any;
    const playwrightPage = { id: 'pw' } as any;

    const puppeteerBrowser = { newPage: vi.fn().mockResolvedValue(puppeteerPage) } as any;
    const playwrightBrowser = { newPage: vi.fn().mockResolvedValue(playwrightPage) } as any;

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
    const browser = { pages: vi.fn().mockResolvedValue([page]) } as any;
    const launch = vi.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = vi.fn().mockReturnValue({ launch });

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
    const browser = { pages: vi.fn().mockResolvedValue([page]) } as any;
    const launch = vi.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = vi.fn().mockReturnValue({ launch });

    const state = await Engines.runPuppeteer({ name: 'runner', type: 'runner', browser: {} } as any, {});

    expect(launch).toHaveBeenCalled();
    expect(state.pages?.main).toBe(page);
  });

  test('connectPuppeteer skips viewport when size missing', async () => {
    const page = { setViewport: vi.fn() } as any;
    const browser = { pages: vi.fn().mockResolvedValue([page]) } as any;
    const connect = vi.fn().mockResolvedValue(browser);
    (global as any).__non_webpack_require__ = vi.fn().mockReturnValue({ connect });

    const result = await Engines.connectPuppeteer('ws://debug', 0, { width: 0, height: 0 }, 1000);
    expect(result.pages.main).toBe(page);
    expect(page.setViewport).not.toHaveBeenCalled();
  });

  test('addPage does not set viewport when size missing', async () => {
    const puppeteerPage = { setViewport: vi.fn() } as any;
    const puppeteerBrowser = { newPage: vi.fn().mockResolvedValue(puppeteerPage) } as any;

    const state = await Engines.addPage(
      { browser: puppeteerBrowser, pages: {} } as any,
      { browser: { engine: 'puppeteer' } } as any,
      { width: 0, height: 0 },
    );

    expect(state.pages.main).toBe(puppeteerPage);
    expect(puppeteerPage.setViewport).not.toHaveBeenCalled();
  });
});
