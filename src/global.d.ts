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

// ================ BROWSERS ====================

export type BrowserType = BrowserPlaywright | BrowserPuppeteer;
export type BrowserPageType = PagePlaywright | PagePuppeteer | FramePuppeteer | FramePlaywright;

export type BrouserLaunchOptions = {
  headless: boolean;
  slowMo: number;
  args: Array<string>;
  devtools?: boolean;
};

export type PagesType = {
  [key: string]: BrowserPageType;
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
  PPD_ENVS: string[];
  PPD_TESTS: string[];
  PPD_OUTPUT: string;
  PPD_DATA: Object;
  PPD_SELECTORS: Object;
  PPD_DEBUG_MODE: boolean;
  PPD_LOG_DISABLED: boolean;
  PPD_LOG_EXTEND: boolean;
  PPD_DISABLE_ENV_CHECK: boolean;
  PPD_LOG_LEVEL_NESTED: number;
  PPD_LOG_LEVEL_TYPE: ColorsType;
  PPD_LOG_LEVEL_TYPE_IGNORE: ColorsType[];
  PPD_LOG_SCREENSHOT: boolean;
  PPD_LOG_FULLPAGE: boolean;
  PPD_LOG_TEST_NAME: boolean;
  PPD_LOG_IGNORE_HIDE_LOG: boolean;
};

export type ArgumentsKeysType = keyof ArgumentsType;

export type SocketType = {
  send: Function;
  sendYAML: Function;
};

// ================ LOGGER ====================

export type LogEntry = {
  text: string;
  time: string;
  dataEnvs: Object;
  dataEnvsGlobal: Object;
  testStruct: Object;
  bindedData: Object;
  screenshots: Array<string>;
  type: string;
  level: string;
  levelIndent: number;
  stepId: string;
};

export type LogOptionsType = {
  logThis?: boolean;
  logChildren?: boolean;
  screenshot?: boolean;
  fullpage?: boolean;
  levelIndent?: number;
  level?: string | number;
  textColor?: ColorsType;
  backgroundColor?: ColorsType;
};

export type LogEntrieType = {
  text: string;
  textColor: ColorsType;
  backgroundColor?: ColorsType;
};

export type LogInputType = {
  text: string;
  funcFile?: string;
  testFile?: string;
  screenshot?: boolean;
  fullpage?: boolean;
  level?: ColorsType;
  element?: Element;
  testStruct?: string;
  levelIndent?: number;
  error?: any;
  testSource?: any;
  bindedData?: any;
  extendInfo?: boolean;
  stdOut?: boolean;
  stepId?: string;
  textColor?: ColorsType;
  backgroundColor?: ColorsType;
  logShowFlag?: boolean;
};

// ================ ENVS ====================

export type EnvStateType = {
  browser: BrowserType;
  pages: PagesType;
  contexts?: Object;
  pid?: number;
};

export type EnvBrowserType = {
  type?: 'browser' | 'electron' | 'api';
  runtime?: 'run' | 'connect';
  engine?: 'puppeteer' | 'playwright';
  browserName?: 'chrome' | 'chromium' | 'firefox' | 'webkit';
  args?: Array<string>;
  headless?: boolean;
  slowMo?: number;
  urlDevtoolsJson?: string;
  windowSize?: {
    width?: number;
    height?: number;
  };
  killOnEnd?: boolean;
  killProcessName: string;
  runtimeEnv?: {
    runtimeExecutable?: string;
    program?: string;
    cwd?: string;
    args?: Array<string>;
    env?: { [key: string]: string };
    secondsToStartApp?: number;
    secondsDelayAfterStartApp?: number;
  };
};

export type EnvYamlType = {
  name: string;
  type: 'env';
  description?: string;
  data?: Object;
  selectors?: Object;
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
  closeBrowsers: Function;
  closeProcesses: Function;
  getActivePage: Function;
  initOutput: (string) => void;
  setCurrentTest: (string) => void;
}

// ================ DATA / SELECTORS ====================

export type DataYamlType = {
  name: string;
  type: 'data' | 'selectors';
  data: Object;
};

export interface DataType extends DataYamlType {
  testFile: string;
}

// ================ TESTS / ATOMS ====================

export type TestJsonExtendType = {
  source: any;
  socket: SocketType;
  stepId: string;
  breadcrumbs: string[];
  testFile: string;
  type: 'atom' | 'test';
  resultsFromParent?: Object;
  resultsFromChildren?: Object;
};

export type TestYamlType = {
  name: string;
  type?: 'atom' | 'test';
};

export interface TestType extends TestYamlType {
  testFile: string;
}

export type InputsTestType = {
  options?: { [key: string]: string };
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
  data?: Object;
  selectors?: Object;
  dataParent?: Object;
  selectorsParent?: Object;
  optionsParent?: Object;
  resultsFromParent?: Object;
  logOptionsParent?: LogOptionsType;
  frame?: string;
};
