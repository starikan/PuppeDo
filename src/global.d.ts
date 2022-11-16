import {
  Page as PagePuppeteer,
  Browser as BrowserPuppeteer,
  // ElementHandle as ElementHandlePuppeteer,
  Frame as FramePuppeteer,
} from 'puppeteer';
import {
  Page as PagePlaywright,
  Browser as BrowserPlaywright,
  // ElementHandle as ElementHandlePlaywright,
  Frame as FramePlaywright,
} from 'playwright';

import { ErrorType } from './Error';
import { PliginsFields } from './Plugins';
import { PluginModule, Plugins } from './PluginsCore';
import { Environment, Runner, Runners } from './Environment';

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

export type Element = any; // ElementHandlePlaywright | ElementHandlePuppeteer;

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
  text: string;
  level: ColorsType;
  levelIndent: number;
  time: Date;
  stepId: string;

  screenshots?: string[];
  funcFile?: string;
  testFile?: string;
  extendInfo?: boolean;
  error?: Error | ErrorType | null;
  textColor?: ColorsType;
  backgroundColor?: ColorsType;
  breadcrumbs?: string[];
  repeat?: number;
};

export type LogOptionsType = {
  logThis?: boolean;
  logChildren?: boolean;
  screenshot?: boolean;
  fullpage?: boolean;
  screenshotName?: string;
  fullpageName?: string;
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
  level?: ColorsType;
  funcFile?: string;
  testFile?: string;
  element?: Element;
  levelIndent?: number;
  error?: Error | ErrorType | null;
  extendInfo?: boolean;
  stdOut?: boolean;
  stepId?: string;
  logShowFlag?: boolean;
  page?: PagePuppeteer | PagePlaywright;
  logOptions?: LogOptionsType;
};

export type LogFunctionType = (options: LogInputType) => Promise<void>;

export type LogTransformer = (logEntry: LogEntry) => Promise<Partial<LogEntry> | LogEntry>;

export type LogFormatter = (
  logEntry: LogEntry,
  logEntryTransformed: Partial<LogEntry>,
) => Promise<LogEntrieType[][] | string>;

export type LogExporter = (
  logEntry: LogEntry,
  logEntryFormated: LogEntrieType[][],
  logString: string,
  options: LogExporterOptions,
) => Promise<void>;

export type LogExporterOptions = { envsId: string; skipThis: boolean; fullLog: LogEntry[] };

export type LogPipe = { transformer: LogTransformer; formatter: LogFormatter; exporter: LogExporter };

// ================ SOCKET ====================

export type SocketType = {
  send: () => void;
  sendYAML: (data: { type: string; data: LogEntry | ErrorType; envsId: string }) => void;
};

// ================ ENVS ====================

export type RunnerStateType = {
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

export type RunnerYamlType = {
  name: string;
  type: 'runner';
  browser: EnvBrowserType;
  description?: string;
  data?: Record<string, unknown>;
  selectors?: Record<string, unknown>;
  dataExt?: Array<string>;
  selectorsExt?: Array<string>;
  runnersExt?: Array<string>;
  log?: {
    level?: string;
    screenshot?: boolean;
    fullpage?: boolean;
  };
};

export interface RunnerType extends RunnerYamlType {
  testFile?: string;
}

export type RunnerCurrentType = {
  name?: string;
  page?: string;
  test?: string;
};

export type Outputs = {
  output?: string;
  name?: string;
  folder?: string;
  folderFull?: string;
};

export type OutputsLatest = {
  folderLatest?: string;
  folderLatestFull?: string;
  output?: string;
};

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
  environment: Environment;
  data: Record<string, unknown>;
  selectors: Record<string, unknown>;
  dataTest: Record<string, unknown>;
  selectorsTest: Record<string, unknown>;
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
  argsEnv: Record<string, unknown>;
  runner: Runner;
  allRunners: Runners;
  browser?: BrowserType;
  page?: BrowserPageType | BrowserFrame;
  log: LogFunctionType;
  name: string;
  description: string;
  socket: SocketType;
  descriptionExtend: string[];
  allData: AllDataType;
  plugins: Plugins;
  continueOnError: boolean;
};

export type TestLifecycleFunctionType = (args?: TestArgsType) => Promise<Record<string, unknown>>;

export type TestTypeYaml = {
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
};

export type TestType = Required<TestTypeYaml>;

export type TestExtendType = {
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
  metaFromPrevSubling?: TestMetaSublingExchangeData;
} & TestType &
  PliginsFields;

export type TestExtendTypeKeys = keyof TestExtendType;

export type TestFunctionsBlockNames = 'beforeTest' | 'runTest' | 'afterTest';

export type AllDataType = {
  allFiles: Array<string>;
  allContent: Array<TestType | RunnerType | DataType>;
  atoms: Array<TestType>;
  tests: Array<TestType>;
  runners: Array<RunnerType>;
  data: Array<DataType>;
  selectors: Array<DataType>;
};

// ================ PLUGINS ====================

export type DocumentationLanguages = 'ru' | 'en';

type PluginDocumentationExample = {
  test: string;
  result: string;
};

export type PluginDocumentation = {
  description: { en: string[] } & Partial<Record<DocumentationLanguages, string[]>>;
  examples: [PluginDocumentationExample, ...PluginDocumentationExample[]];
  name: string;
  type: string;
  propogation: boolean;
};

export type RunOptions = {
  closeProcess: boolean;
  stdOut: boolean;
  closeAllEnvs: boolean;
  globalConfigFile: string;
  pluginsList: PluginModule<unknown>[];
  loggerPipes: LogPipe[];
  argsConfig: Partial<ArgumentsType>;
  socket: SocketType;
};
