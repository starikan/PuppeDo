import path from 'path';

import { ArgumentsType, LogPipe, RunOptions } from './global.d';

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
import { exporterAllure } from './Plugins/allureSuite/Allure';
import allureSuite from './Plugins/allureSuite/allureSuite';

export const pluginsListDefault = [skipSublingIfResult, continueOnError, descriptionError, argsRedefine, allureSuite];

export const loggerPipesDefault: LogPipe[] = [
  { transformer: transformerEquity, formatter: formatterEmpty, exporter: exporterLogInMemory },
  { transformer: transformerEquity, formatter: formatterEntry, exporter: exporterConsole },
  { transformer: transformerEquity, formatter: formatterEntry, exporter: exporterLogFile },
  { transformer: transformerEquity, formatter: formatterEntry, exporter: exporterSocket },
  { transformer: transformerYamlLog, formatter: formatterYamlToString, exporter: exporterYamlLog },
  { transformer: transformerEquity, formatter: formatterEmpty, exporter: exporterAllure },
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
};

export const getArgsDefault = (): ArgumentsType => argsDefault;

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
