import {
  Page as PagePuppeteer,
  Browser as BrowserPuppeteer,
  ElementHandle as ElementHandlePuppeteer,
  Frame as FramePuppeteer,
} from 'puppeteer';
import {
  Page as PagePlaywright,
  Browser as BrowserPlaywright,
  ElementHandle as ElementHandlePlaywright,
  Frame as FramePlaywright,
} from 'playwright';

import { ErrorType } from './Error';

// ================ BROWSERS ====================

export type BrowserType = BrowserPlaywright | BrowserPuppeteer;
export type BrowserPageType = PagePlaywright | PagePuppeteer;
export type BrowserFrame = FramePuppeteer | FramePlaywright;

export type BrouserLaunchOptions = {
  headless: boolean;
  slowMo: number;
  args: Array<string>;
  devtools?: boolean;
};

export type PagesType = {
  [key: string]: BrowserPageType | BrowserFrame;
};

export type Element = ElementHandlePuppeteer | ElementHandlePlaywright;

// ================ HELPERS ====================

export type ColorsType =
  | 'sane'
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'blackBackground'
  | 'redBackground'
  | 'greenBackground'
  | 'yellowBackground'
  | 'blueBackground'
  | 'magentaBackground'
  | 'cyanBackground'
  | 'whiteBackground'
  | 'raw'
  | 'timer'
  | 'debug'
  | 'info'
  | 'test'
  | 'warn'
  | 'error'
  | 'trace'
  | 'env';

export type ArgumentsType = {
  PPD_ROOT: string;
  PPD_ROOT_ADDITIONAL: string[];
  PPD_ROOT_IGNORE: string[];
  PPD_TESTS: string[];
  PPD_OUTPUT: string;
  PPD_DATA: Record<string, unknown>;
  PPD_SELECTORS: Record<string, unknown>;
  PPD_DEBUG_MODE: boolean;
  PPD_LOG_DISABLED: boolean;
  PPD_LOG_EXTEND: boolean;
  PPD_LOG_LEVEL_NESTED: number;
  PPD_LOG_LEVEL_TYPE: ColorsType;
  PPD_LOG_LEVEL_TYPE_IGNORE: ColorsType[];
  PPD_LOG_SCREENSHOT: boolean;
  PPD_LOG_FULLPAGE: boolean;
  PPD_LOG_TEST_NAME: boolean;
  PPD_LOG_IGNORE_HIDE_LOG: boolean;
  PPD_TAGS_TO_RUN: string[];
};

export type ArgumentsKeysType = keyof ArgumentsType;

// ================ LOGGER ====================

export type LogEntry = {
  text?: string;
  time?: string;
  dataEnvs?: Record<string, unknown>;
  dataEnvsGlobal?: Record<string, unknown>;
  // eslint-disable-next-line no-use-before-define
  testArgs?: TestArgsType;
  screenshots?: Array<string>;
  type?: string;
  level?: string;
  levelIndent?: number;
  stepId?: string;
};

export type LogOptionsType = {
  logThis?: boolean;
  logChildren?: boolean;
  screenshot?: boolean;
  fullpage?: boolean;
  levelIndent?: number;
  level?: ColorsType;
  textColor?: ColorsType;
  backgroundColor?: ColorsType;
};

export type LogEntrieType = {
  text: string;
  textColor: ColorsType;
  backgroundColor?: ColorsType;
};

export type LogInputType = {
  text: string | string[];
  funcFile?: string;
  testFile?: string;
  screenshot?: boolean;
  fullpage?: boolean;
  level?: ColorsType;
  element?: Element;
  levelIndent?: number;
  error?: Error | ErrorType | null;
  // eslint-disable-next-line no-use-before-define
  testArgs?: TestArgsType;
  extendInfo?: boolean;
  stdOut?: boolean;
  stepId?: string;
  textColor?: ColorsType;
  backgroundColor?: ColorsType;
  logShowFlag?: boolean;
};

export type LogFunctionType = (options: LogInputType) => Promise<void>;

// ================ SOCKET ====================

export type SocketType = {
  send: () => void;
  sendYAML: (data: { type: string; data: LogEntry; envsId: string }) => void;
};

// ================ ENVS ====================

export type EnvStateType = {
  browser: BrowserType;
  pages: PagesType;
  contexts?: Record<string, unknown>;
  pid?: number;
};

export type BrowserTypeType = 'browser' | 'electron' | 'api';
export type BrowserEngineType = 'puppeteer' | 'playwright';
export type BrowserNameType = 'chrome' | 'chromium' | 'firefox' | 'webkit';

export type EnvBrowserType = {
  type?: BrowserTypeType;
  engine?: BrowserEngineType;
  browserName?: BrowserNameType;
  runtime?: 'run' | 'connect';
  args?: Array<string>;
  headless?: boolean;
  slowMo?: number;
  urlDevtoolsJson?: string;
  windowSize?: {
    width?: number;
    height?: number;
  };
  killOnEnd?: boolean;
  killProcessName?: string;
  runtimeEnv?: {
    runtimeExecutable?: string;
    program?: string;
    cwd?: string;
    args?: Array<string>;
    env?: Record<string, string>;
    secondsToStartApp?: number;
    secondsDelayAfterStartApp?: number;
  };
  timeout?: number;
};

export type EnvYamlType = {
  name: string;
  type: 'env';
  description?: string;
  data?: Record<string, unknown>;
  selectors?: Record<string, unknown>;
  dataExt?: Array<string>;
  selectorsExt?: Array<string>;
  envsExt?: Array<string>;
  browser?: EnvBrowserType;
  log?: {
    level?: string;
    screenshot?: boolean;
    fullpage?: boolean;
  };
};

export interface EnvType extends EnvYamlType {
  testFile: string;
}

export interface EnvsPoolType {
  envs: {
    [key: string]: {
      env: EnvType;
      name: string;
      state: EnvStateType;
    };
  };
  current: {
    name?: string;
    page?: string;
    test?: string;
  };
  output: {
    folder?: string;
    folderLatest?: string;
    folderLatestFull?: string;
    output?: string;
    name?: string;
    folderFull?: string;
  };
  log: Array<LogEntry>;
  closeBrowsers: () => Promise<void>;
  closeProcesses: () => Promise<void>;
  getActivePage: () => BrowserPageType | BrowserFrame;
  initOutput: (envsId: string) => void;
  setCurrentTest: (testName: string) => void;
}

// ================ DATA / SELECTORS ====================

export type DataYamlType = {
  name: string;
  type: 'data' | 'selectors';
  data: Record<string, unknown>;
};

export interface DataType extends DataYamlType {
  testFile: string;
}

// ================ TESTS / ATOMS ====================

export type TestArgsType = {
  envsId: string;
  data: Record<string, unknown>;
  selectors: Record<string, unknown>;
  dataTest: Record<string, unknown>;
  selectorsTest: Record<string, unknown>;
  envName: string;
  envPageName: string;
  options: Record<string, string | number>;
  allowResults: Array<string>;
  bindResults: Record<string, string>;
  bindSelectors: Record<string, string>;
  bindData: Record<string, string>;
  bindDescription: string;
  levelIndent: number;
  repeat: number;
  stepId: string;
  debug: boolean;
  logOptions: LogOptionsType;
  frame: string;
  tags: string[];
  ppd: {
    runScriptInContext: (source: string, context: Record<string, unknown>) => unknown;
  };
};

export type TestArgsExtType = {
  env: {
    name: string;
    state: EnvStateType; // Browser, pages, cookies, etc.
    env: EnvType;
  };
  envs: EnvsPoolType;
  browser: BrowserType;
  page: BrowserPageType | BrowserFrame;
  log: LogFunctionType;
  name: string;
  description: string;
  socket: SocketType;
} & TestArgsType;

export type TestLifecycleFunctionType = (args: TestArgsExtType) => Promise<Record<string, unknown> | void>;

export interface TestTypeYaml {
  name: string;
  type?: 'atom' | 'test';
  needData?: Array<string>;
  needSelectors?: Array<string>;
  options?: Record<string, string | number>;
  dataExt?: Array<string>;
  selectorsExt?: Array<string>;
  allowResults?: Array<string>;
  allowOptions?: Array<string>;
  todo?: string;
  debug?: boolean;
  debugInfo?: 'data' | 'selectors' | boolean;
  disable?: boolean;
  logOptions?: LogOptionsType;
  frame?: string;
  data?: Record<string, unknown>;
  bindData?: Record<string, string>;
  selectors?: Record<string, unknown>;
  bindSelectors?: Record<string, string>;
  bindResults?: Record<string, string>;
  description?: string;
  descriptionExtend?: Array<string>;
  descriptionError?: string;
  bindDescription?: string;
  repeat?: number;
  while?: string;
  if?: string;
  errorIf?: string;
  errorIfResult?: string;
  tags?: Array<string>;
  engineSupports?: BrowserEngineType[] | null;
  testFile: string;
  beforeTest?: Record<string, unknown>[] | TestLifecycleFunctionType | TestLifecycleFunctionType[];
  runTest?: Record<string, unknown>[] | TestLifecycleFunctionType | TestLifecycleFunctionType[];
  afterTest?: Record<string, unknown>[] | TestLifecycleFunctionType | TestLifecycleFunctionType[];
}

export type TestType = Required<TestTypeYaml>;

export type TestExtendType = TestType & {
  levelIndent?: number;
  breadcrumbs?: string[];
  stepId?: string;
  source?: string;
  socket?: SocketType;
  envsId?: string;
  resultsFromChildren?: Record<string, unknown>;
  resultsFromParent?: Record<string, unknown>;
  funcFile?: string;
};

export type InputsTestType = {
  options?: Record<string, string | number>;
  description?: string;
  descriptionExtend?: string[];
  bindDescription?: string;
  repeat?: number;
  while?: string;
  if?: string;
  errorIf?: string;
  errorIfResult?: string;
  debug?: boolean;
  dataExt?: Array<string>;
  selectorsExt?: Array<string>;
  data?: Record<string, unknown>;
  selectors?: Record<string, unknown>;
  dataParent?: Record<string, unknown>;
  selectorsParent?: Record<string, unknown>;
  optionsParent?: Record<string, string | number>;
  resultsFromParent?: Record<string, unknown>;
  logOptionsParent?: LogOptionsType;
  frame?: string;
};
