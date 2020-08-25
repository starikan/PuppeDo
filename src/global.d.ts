type Colors =
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

type ArgumentsType = {
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
  PPD_LOG_LEVEL_TYPE: Colors;
  PPD_LOG_LEVEL_TYPE_IGNORE: Colors[];
  PPD_LOG_SCREENSHOT: boolean;
  PPD_LOG_FULLPAGE: boolean;
};

type ArgumentsKeysType = keyof ArgumentsType;

type SocketType = {
  send: Function;
  sendYAML: Function;
};

// ================ ENVS ====================

type BrowserType = import('playwright').Browser | import('puppeteer').Browser;
type BrowserPageType = import('playwright').Page | import('puppeteer').Page;

type BrouserLaunchOptions = {
  headless: boolean;
  slowMo: number;
  args: Array<string>;
  devtools?: boolean;
};

type PagesType = {
  [key: string]: BrowserPageType;
};

type EnvStateType = {
  browser: BrowserType;
  pages: PagesType;
  contexts?: Object;
  pid?: number;
};

type EnvBrowserType = {
  type?: 'browser' | 'electron' | 'api';
  runtime?: 'run' | 'connect';
  engine?: 'puppeteer' | 'playwright';
  browserName?: 'chromium' | 'firefox' | 'webkit';
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
    pauseAfterStartApp?: number;
  };
};

type EnvYamlType = {
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

interface EnvType extends EnvYamlType {
  testFile: string;
}

interface EnvsPoolType {
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
  getOutputsFolders: Function;
  closeBrowsers: Function;
  closeProcesses: Function;
  getActivePage: Function;
}

// ================ DATA / SELECTORS ====================

type DataYamlType = {
  name: string;
  type: 'data' | 'selectors';
  data: Object;
};

interface DataType extends DataYamlType {
  testFile: string;
}

// ================ TESTS / ATOMS ====================

type TestJsonExtendType = {
  source: any;
  socket: SocketType;
  stepId: string;
  breadcrumbs: string[];
  testFile: string;
  type: 'atom' | 'test';
  resultsFromParent?: Object;
  resultsFromChildren?: Object;
};

type TestYamlType = {
  name: string;
  type?: 'atom' | 'test';
};

interface TestType extends TestYamlType {
  testFile: string;
}

type InputsTestType = {
  options?: { [key: string]: string };
  description?: string;
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
};

// ================ LOGGER ====================

type LogEntry = {
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

type LogOptionsType = {
  notShow?: boolean;
  screenshot?: boolean;
  fullpage?: boolean;
  levelIndent?: number;
  level?: string | number;
  textColor?: Colors;
  backgroundColor?: Colors;
};

type LogEntrieType = {
  text: string;
  textColor: Colors;
  backgroundColor?: Colors;
};

type LogInputType = {
  text: string;
  funcFile?: string;
  testFile?: string;
  screenshot?: boolean;
  fullpage?: boolean;
  level?: Colors;
  element?: any;
  testStruct?: string;
  levelIndent?: number;
  error?: any;
  testSource?: any;
  bindedData?: any;
  extendInfo?: boolean;
  stdOut?: boolean;
  stepId?: string;
  textColor?: Colors;
  backgroundColor?: Colors;
  notShow?: boolean;
};
