/* eslint-disable no-use-before-define */
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
  executablePath?: string;
  timeout?: number;
};

export type PagesType = Record<string, BrowserPageType | BrowserFrame>;

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
  PPD_FILES_IGNORE: string[];
  PPD_TESTS: string[];
  PPD_OUTPUT: string;
  PPD_DATA: Record<string, unknown>;
  PPD_SELECTORS: Record<string, unknown>;
  PPD_DEBUG_MODE: boolean;
  PPD_LOG_DISABLED: boolean;
  PPD_LOG_EXTEND: boolean;
  PPD_LOG_LEVEL_NESTED: number;
  PPD_LOG_LEVEL_TYPE_IGNORE: ColorsType[];
  PPD_LOG_SCREENSHOT: boolean;
  PPD_LOG_FULLPAGE: boolean;
  PPD_LOG_TEST_NAME: boolean;
  PPD_LOG_IGNORE_HIDE_LOG: boolean;
  PPD_TAGS_TO_RUN: string[];
  PPD_LOG_DOCUMENTATION_MODE: boolean;
  PPD_LOG_NAMES_ONLY: string[];
  PPD_LOG_TIMER_SHOW: boolean;
  PPD_LOG_TIMESTAMP_SHOW: boolean;
  PPD_LOG_INDENT_LENGTH: number;
  PPD_CONTINUE_ON_ERROR_ENABLED: boolean;
  PPD_IGNORE_TESTS_WITHOUT_NAME: boolean;
};

export type ArgumentsKeysType = keyof ArgumentsType;

// ================ LOGGER ====================

export type LogEntry = {
  text?: string;
  time?: string;
  dataEnvs?: Record<string, unknown>;
  dataEnvsGlobal?: Record<string, unknown>;
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
  screenshotName?: string;
  fullpageName?: string;
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
  screenshotName?: string;
  fullpageName?: string;
  level?: ColorsType;
  element?: Element;
  levelIndent?: number;
  error?: Error | ErrorType | null;
  extendInfo?: boolean;
  stdOut?: boolean;
  stepId?: string;
  textColor?: ColorsType;
  backgroundColor?: ColorsType;
  logShowFlag?: boolean;
  page?: PagePuppeteer | PagePlaywright;
};

export type LogFunctionType = (options: LogInputType) => Promise<void>;

// ================ SOCKET ====================

export type SocketType = {
  send: () => void;
  sendYAML: (data: { type: string; data: LogEntry; envsId: string }) => void;
};

// ================ ENVS ====================

export type EnvStateType = {
  browser?: BrowserType;
  browserSettings?: EnvBrowserType;
  pages?: PagesType;
  contexts?: Record<string, unknown>;
  pid?: number;
};

export type BrowserTypeType = 'browser' | 'electron';
export type BrowserEngineType = 'puppeteer' | 'playwright';
export type BrowserNameType = 'chrome' | 'chromium' | 'firefox' | 'webkit';

export type EnvBrowserType = {
  type: BrowserTypeType;
  engine: BrowserEngineType;
  browserName: BrowserNameType;
  runtime: 'run' | 'connect';
  executablePath?: string;
  headless: boolean;
  slowMo: number;
  args?: Array<string>;
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
  browser: EnvBrowserType;
  description?: string;
  data?: Record<string, unknown>;
  selectors?: Record<string, unknown>;
  dataExt?: Array<string>;
  selectorsExt?: Array<string>;
  envsExt?: Array<string>;
  log?: {
    level?: string;
    screenshot?: boolean;
    fullpage?: boolean;
  };
};

export interface EnvType extends EnvYamlType {
  testFile?: string;
}

export interface EnvsPoolType {
  envs: Record<string, { env: EnvType; name: string; state: EnvStateType }>;
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
  closeAllEnvs: () => Promise<void>;
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

export type TestMetaSublingExchangeData = {
  disable?: boolean;
  skipBecausePrevSubling?: boolean;
};

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
  disable: boolean;
  logOptions: LogOptionsType;
  frame: string;
  tags: string[];
  ppd: {
    runScriptInContext: (source: string, context: Record<string, unknown>) => unknown;
  };
  continueOnError: boolean;
  argsEnv: Record<string, unknown>;
};

export type TestArgsExtType = {
  env: {
    name: string;
    state: EnvStateType; // Browser, pages, cookies, etc.
    env: EnvType;
  };
  envs: EnvsPoolType;
  browser?: BrowserType;
  page?: BrowserPageType | BrowserFrame;
  log: LogFunctionType;
  name: string;
  description: string;
  socket: SocketType;
  descriptionExtend: string[];
  allData: AllDataType;
} & TestArgsType;

export type TestLifecycleFunctionType = (args?: TestArgsExtType) => Promise<Record<string, unknown>>;

export interface TestTypeYaml {
  name: string;
  type?: 'atom' | 'test';
  needData?: Array<string>;
  needSelectors?: Array<string>;
  needEnvParams?: string[];
  options?: Record<string, string | number>;
  dataExt?: Array<string>;
  selectorsExt?: Array<string>;
  allowResults?: Array<string>;
  allowOptions?: Array<string>;
  todo?: string;
  debug?: boolean;
  debugInfo?: boolean | 'data' | 'selectors';
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
  engineSupports?: BrowserEngineType[];
  beforeTest?: TestLifecycleFunctionType[] | TestExtendType[];
  runTest?: TestLifecycleFunctionType[] | TestExtendType[];
  afterTest?: TestLifecycleFunctionType[] | TestExtendType[];
  inlineJS?: string;
  argsRedefine?: Partial<ArgumentsType>;
  continueOnError?: boolean;
}

export type TestType = Required<TestTypeYaml>;

export type TestExtendType = TestType & {
  levelIndent?: number;
  breadcrumbs?: string[];
  breadcrumbsDescriptions?: string[];
  stepId?: string;
  source?: string;
  socket?: SocketType;
  envsId?: string;
  resultsFromPrevSubling?: Record<string, unknown>;
  funcFile?: string;
  dataParent?: Record<string, unknown>;
  selectorsParent?: Record<string, unknown>;
  optionsParent?: Record<string, string | number>;
  logOptionsParent?: LogOptionsType;
  testFile?: string;
  breakParentIfResult?: string;
  skipSublingIfResult?: string;
  metaFromPrevSubling?: TestMetaSublingExchangeData;
};

export type TestExtendTypeKeys = keyof TestExtendType;

export type TestFunctionsBlockNames = 'beforeTest' | 'runTest' | 'afterTest';

export type AllDataType = {
  allFiles: Array<string>;
  allContent: Array<TestType | EnvType | DataType>;
  atoms: Array<TestType>;
  tests: Array<TestType>;
  envs: Array<EnvType>;
  data: Array<DataType>;
  selectors: Array<DataType>;
};
