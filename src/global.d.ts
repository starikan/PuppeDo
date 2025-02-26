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
import { PluginModule, Plugins } from './PluginsCore';
import { Environment, Runner, Runners } from './Environment';
import { argsDefault } from './Defaults';
import { colors } from './Helpers';

// ================ BROWSERS ====================

export type BrowserType = BrowserPlaywright | BrowserPuppeteer;
export type BrowserPageType = PagePlaywright | PagePuppeteer;
export type BrowserFrame = FramePuppeteer | FramePlaywright;

export type BrouserLaunchOptions = {
  headless: boolean;
  slowMo: number;
  args: string[];
  devtools?: boolean;
  executablePath?: string;
  timeout?: number;
};

export type PagesType = Record<string, BrowserPageType | BrowserFrame>;

export type Element = any; // ElementHandlePlaywright | ElementHandlePuppeteer;

// ================ HELPERS ====================

export type ColorsType = keyof typeof colors;

export type AliasesKeysType = 'data' | 'bindData' | 'selectors' | 'bindSelectors' | 'bindResults' | 'options' | string; // Adding string to support any keys

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
  PPD_LOG_STEPID: boolean;
  PPD_CONTINUE_ON_ERROR_ENABLED: boolean;
  PPD_IGNORE_TESTS_WITHOUT_NAME: boolean;
  PPD_FILES_EXTENSIONS_AVAILABLE: string[];
  PPD_ALIASES: Record<Partial<AliasesKeysType>, string[]>;
  PPD_LIFE_CYCLE_FUNCTIONS: string[];
};

export type ArgumentsKeysType = keyof ArgumentsType;

// Fix conflict prettier in package.json with vscode plugin
type ArgumentsValuesType_UtilityType = typeof argsDefault;

export type ArgumentsValuesType = ArgumentsValuesType_UtilityType[ArgumentsKeysType];

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
  logMeta?: LogMetaInfoType;
};

export type LogMetaInfoType = {
  funcFile?: string;
  testFile?: string;
  extendInfo?: boolean;
  breadcrumbs?: string[];
  repeat?: number;
  timeStart?: Date;
  timeEnd?: Date;
};

export type LogOptionsType = {
  logThis?: boolean;
  logChildren?: boolean;
  logShowFlag?: boolean;
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
  backgroundColor: ColorsType;
};

export type LogInputType = {
  text: string | string[];
  level?: ColorsType;
  element?: Element;
  levelIndent?: number;
  error?: Error | ErrorType | null;
  stepId?: string;
  page?: PagePuppeteer | PagePlaywright;
  logMeta?: LogMetaInfoType;
  logOptions?: LogOptionsType;
  args?: TestArgsType;
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

export type LogExporterOptions = { envsId: string; skipThis: boolean };

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
  args?: string[];
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
    args?: string[];
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
  dataExt?: string[];
  selectorsExt?: string[];
  runnersExt?: string[];
  log?: {
    level?: ColorsType;
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
  output: string;
  name: string;
  folder: string;
  folderFull: string;
  folderLatest: string;
  folderLatestFull: string;
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
  allowResults: string[];
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
  description: string;
  socket: SocketType;
  descriptionExtend: string[];
  allData: AllDataType;
  plugins: Plugins;
  breadcrumbs: string[];
} & AgentData;

export type TestLifeCycleFunctionType = (args?: TestArgsType) => Promise<Record<string, unknown>>;

export type LifeCycleFunction = Record<string, TestTypeYaml>;

/**
 * YAML agent file structure
 * This is the main structure of the agent. All fields present here are processed and used in the operation of the agent.
 * Some fields can be overridden using PPD_ALIASES
 */
export type TestTypeYaml = {
  name: string;
  type?: 'runners' | 'data' | 'selectors' | string;
  needData?: string[];
  needSelectors?: string[];
  needEnvParams?: string[];
  options?: Record<string, string | number>;
  dataExt?: string[];
  selectorsExt?: string[];
  allowResults?: string[];
  allowOptions?: string[];
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
  descriptionExtend?: string[];
  bindDescription?: string;
  repeat?: number;
  while?: string;
  if?: string;
  errorIf?: string;
  errorIfResult?: string;
  tags?: string[];
  inlineJS?: string;
  breakParentIfResult?: string;
  [key: string]: LifeCycleFunction[] | unknown;
};

export type TestExtendType = {
  levelIndent?: number;
  breadcrumbs?: string[];
  breadcrumbsDescriptions?: string[];
  stepIdParent?: string;
  stepId?: string;
  source?: string;
  socket?: SocketType;
  envsId?: string;
  resultsFromPrevSubling?: Record<string, unknown>;
  dataParent?: Record<string, unknown>;
  selectorsParent?: Record<string, unknown>;
  metaFromPrevSubling?: TestMetaSublingExchangeData;
  funcFile?: string;
  testFile?: string;
  optionsParent?: Record<string, string | number>;
  logOptionsParent?: LogOptionsType;
  atomRun?: TestLifeCycleFunctionType[];
} & Required<TestTypeYaml>;

export type TestType = Required<TestTypeYaml>;

export type AgentData = Required<TestExtendType>;

export type AllDataType = {
  allFiles: string[];
  allContent: Array<TestType | RunnerType | DataType>;
  agents: Array<TestType>;
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

export type PluginList = Record<string, { plugin: PluginModule<unknown> | string; order?: number }>;

export type RunOptions = {
  closeProcess: boolean;
  stdOut: boolean;
  closeAllEnvs: boolean;
  globalConfigFile: string;
  pluginsList: PluginList;
  loggerPipes: LogPipe[];
  argsConfig: Partial<ArgumentsType>;
  socket: SocketType;
  debug: boolean;
};

export type TreeEntryDataType = TestExtendType & {
  timeStart: Date;
  timeEnd: Date;
};

export type TreeEntryType = Partial<TreeEntryDataType> & {
  stepId: string;
  stepIdParent: string;
  steps?: TreeType;
};

export type TreeType = TreeEntryType[];

export type DeepMergeable =
  | { [key: string]: DeepMergeable }
  | DeepMergeable[]
  | string
  | number
  | boolean
  | null
  | undefined
  | Function
  | Record<string, unknown>
  | unknown;
