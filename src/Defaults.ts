import path from 'path';

import { AgentData, ArgumentsType, LogPipe, RunOptions, TestTypeYaml } from './global.d';

import continueOnError from './Plugins/continueOnError/continueOnError';
import skipSublingIfResult from './Plugins/skipSublingIfResult/skipSublingIfResult';
import argsRedefine from './Plugins/argsRedefine/argsRedefine';
import descriptionError from './Plugins/descriptionError/descriptionError';

import { transformerEquity, transformerYamlLog } from './Loggers/Transformers';
import { formatterEmpty, formatterEntry, formatterYamlToString } from './Loggers/Formatters';
import {
  exporterConsole,
  exporterLogFile,
  exporterLogInMemory,
  exporterSocket,
  exporterYamlLog,
} from './Loggers/Exporters';
import { blankSocket } from './Helpers';

export const pluginsListDefault = [skipSublingIfResult, continueOnError, descriptionError, argsRedefine];

export const loggerPipesDefault: LogPipe[] = [
  { transformer: transformerEquity, formatter: formatterEmpty, exporter: exporterLogInMemory },
  { transformer: transformerEquity, formatter: formatterEntry, exporter: exporterConsole },
  { transformer: transformerEquity, formatter: formatterEntry, exporter: exporterLogFile },
  { transformer: transformerEquity, formatter: formatterEntry, exporter: exporterSocket },
  { transformer: transformerYamlLog, formatter: formatterYamlToString, exporter: exporterYamlLog },
];

export const argsDefault: ArgumentsType = {
  PPD_ROOT: process.cwd(),
  PPD_ROOT_ADDITIONAL: [],
  PPD_ROOT_IGNORE: ['.git', 'node_modules', '.history', 'output', '.github', '.vscode'],
  PPD_FILES_IGNORE: [],
  PPD_TESTS: [],
  PPD_DATA: {},
  PPD_SELECTORS: {},
  PPD_DEBUG_MODE: false,
  PPD_TAGS_TO_RUN: [],
  PPD_CONTINUE_ON_ERROR_ENABLED: false,
  PPD_OUTPUT: 'output',
  PPD_LOG_DISABLED: false,
  PPD_LOG_EXTEND: false,
  PPD_LOG_LEVEL_NESTED: 0,
  PPD_LOG_LEVEL_TYPE_IGNORE: [],
  PPD_LOG_SCREENSHOT: false,
  PPD_LOG_FULLPAGE: false,
  PPD_LOG_TEST_NAME: true,
  PPD_LOG_IGNORE_HIDE_LOG: false,
  PPD_LOG_DOCUMENTATION_MODE: false,
  PPD_LOG_NAMES_ONLY: [],
  PPD_LOG_TIMESTAMP_SHOW: true,
  PPD_LOG_TIMER_SHOW: true,
  PPD_LOG_INDENT_LENGTH: 4,
  PPD_LOG_STEPID: false,
  PPD_IGNORE_TESTS_WITHOUT_NAME: true,
  PPD_FILES_EXTENSIONS_AVAILABLE: ['.yaml', '.yml', '.ppd', '.json'],
  PPD_ALIASES: {},
  PPD_LIFE_CYCLE_FUNCTIONS: ['beforeRun', 'run', 'afterRun'],
};

export const BLANK_AGENT: Required<TestTypeYaml> = {
  allowOptions: [],
  allowResults: [],
  bindData: {},
  bindDescription: '',
  bindResults: {},
  bindSelectors: {},
  data: {},
  dataExt: [],
  debug: false,
  debugInfo: false,
  description: '',
  descriptionExtend: [],
  disable: false,
  engineSupports: [],
  errorIf: '',
  errorIfResult: '',
  frame: '',
  if: '',
  inlineJS: '',
  logOptions: {},
  name: '',
  needData: [],
  needSelectors: [],
  needEnvParams: [],
  options: {},
  repeat: 1,
  selectors: {},
  selectorsExt: [],
  tags: [],
  todo: '',
  type: 'agent',
  while: '',
  breakParentIfResult: '',
  argsRedefine: {},
  continueOnError: false,
  descriptionError: '',
  skipSublingIfResult: '',
};

export const EXTEND_BLANK_AGENT = (): AgentData => {
  const result: AgentData = {
    ...JSON.parse(JSON.stringify(BLANK_AGENT)),
    envsId: '',
    stepId: '',
    breadcrumbs: [],
    breadcrumbsDescriptions: [],
    resultsFromPrevSubling: {},
    source: '',
    funcFile: '',
    testFile: '',
    levelIndent: 0,
    dataParent: {},
    selectorsParent: {},
    metaFromPrevSubling: {},
    optionsParent: {},
    logOptionsParent: {},
    socket: blankSocket,
    // atomRun: () => {},
  } as AgentData;
  // TODO: Несогласованая типизация

  return result;
};

export const resolveOptions = (options: Partial<RunOptions>): RunOptions => {
  const configGlobal = __non_webpack_require__(
    path.join(process.cwd(), options.globalConfigFile ?? 'puppedo.config.js'),
  );

  const config: RunOptions = {
    pluginsList: [...pluginsListDefault, ...(configGlobal.pluginsList ?? []), ...(options.pluginsList ?? [])],
    loggerPipes: [...loggerPipesDefault, ...(configGlobal.loggerPipes ?? []), ...(options.loggerPipes ?? [])],
    argsConfig: configGlobal.args ?? {},
    closeAllEnvs: options.closeAllEnvs ?? true,
    closeProcess: options.closeProcess ?? true,
    stdOut: options.stdOut ?? true,
    globalConfigFile: options.globalConfigFile ?? 'puppedo.config.js',
    socket: blankSocket,
    debug: !!options.debug,
  };

  return config;
};
