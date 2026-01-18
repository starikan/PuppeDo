import type { AgentTree } from './AgentTree';
import { Arguments } from './Arguments';
import { Environment, type Runner } from './Environment';
import type { Log } from './Log';

import type { AgentData, LogInputType, SocketType } from './model';
import type { PluginContinueOnError, PluginDescriptionError } from './Plugins';
import type { Plugins } from './PluginsCore';
import type { Test } from './Test';

export interface ErrorType extends Error {
  envsId: string;
  runners: Runner;
  socket: SocketType;
  stepId: string;
  testDescription: string;
  message: string;
  stack: string;
  type: string;
  breadcrumbs: string[];
  breadcrumbsDescriptions: string[];
  test?: Test;
}

type ErrorTestConstructor = {
  logger: Log;
  parentError?: ErrorType;
  agent: AgentData;
  plugins: Plugins;
};

type ErrorContinueParentConstructor = {
  localResults: Record<string, unknown>;
  errorLevel: number;
  logger: Log;
  test: Test;
  parentError?: ErrorType;
  agent: AgentData;
};

export class AbstractError extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
  }
}

export class TestError extends AbstractError {
  envsId: string;
  runners: Runner;
  socket: SocketType;
  stepId: string;
  testDescription: string;
  message: string;
  stack: string;
  logger: Log;
  agent: AgentData;
  parentTest: Test;
  breadcrumbs: string[];
  breadcrumbsDescriptions: string[];
  plugins: Plugins;
  testTree: AgentTree;

  // TODO: избавиться от test тут
  constructor({ logger, parentError, agent, plugins }: ErrorTestConstructor) {
    super();

    this.agent = agent;
    this.plugins = plugins;

    this.envsId = parentError?.envsId || this.agent.envsId;
    this.socket = parentError?.socket || this.agent.socket;
    this.stepId = this.agent.stepId ?? parentError?.stepId;

    this.testDescription = parentError?.testDescription || this.agent.description;
    this.message = `${parentError?.message} || error in test = ${this.agent.name}`;
    this.stack = parentError?.stack;
    this.breadcrumbs = parentError?.breadcrumbs || this.agent.breadcrumbs;
    this.breadcrumbsDescriptions = parentError?.breadcrumbsDescriptions || this.agent.breadcrumbsDescriptions;

    this.logger = logger;
    this.parentTest = parentError?.test;

    this.testTree = new Environment().getEnvInstance(this.plugins.envsId).testTree;
  }

  async log(): Promise<void> {
    const { stepId, breadcrumbs, funcFile, testFile, levelIndent } = this.agent;
    const { continueOnError } = this.plugins.getPlugins<PluginContinueOnError>('continueOnError').getValues(stepId);
    const { descriptionError } = this.plugins
      .getPlugins<PluginDescriptionError>('descriptionError')
      .getValues(this.stepId);

    // TODO: 2022-10-06 S.Starodubov BUG bindDescription not work
    const text = `${descriptionError ? `${descriptionError} | ` : ' '}Description: ${
      this.agent.description || 'No test description'
    } (${this.agent.name})`;
    const errorData: LogInputType = {
      level: 'error',
      text,
      stepId,
      levelIndent,
      error: this,
      logMeta: { funcFile, testFile, breadcrumbs },
      logOptions: { screenshot: false },
    };

    if (!continueOnError) {
      await this.logger.log(errorData);
    }

    this.testTree.addError({ stepId, payload: errorData });

    if (levelIndent === 0 || continueOnError) {
      await this.summaryInfo();
    }
  }

  async summaryInfo(): Promise<void> {
    const { message = '', breadcrumbs = [], breadcrumbsDescriptions = [] } = this;

    const errors = this.testTree.getErrors();
    const descriptionErrorPath = errors
      .map(
        (v) => this.plugins.getPlugins<PluginDescriptionError>('descriptionError').getValues(v.stepId).descriptionError,
      )
      .filter((v) => !!v)
      .join(' | ');

    // TODO: 2022-10-06 S.Starodubov BUG bindDescription not work
    const text = [
      `█ SUMMARY ERROR INFO:
                      █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                      █ Message:     ${message.split(' || ')[0]}
                      █ Error:       ${descriptionErrorPath}
                      █ Path:        ${breadcrumbs.join(' -> ')}
                      █ Description:`,
      ...breadcrumbsDescriptions.map((v, i) => `                      █ ${' '.repeat((1 + i) * 3)}${v}`),
    ].join('\n');
    await this.logger.log({ level: 'error', text, logMeta: { extendInfo: true } });

    this.testTree.clearErrors();
  }
}

export class ContinueParentError extends AbstractError {
  logger: Log;
  test: Test;
  errorLevel: number;
  localResults: Record<string, unknown>;
  parentError?: ErrorType;
  agent: AgentData;

  constructor({ localResults, errorLevel, logger, test, parentError, agent }: ErrorContinueParentConstructor) {
    super();

    this.agent = agent;

    this.localResults = localResults;
    this.errorLevel = errorLevel;
    this.logger = logger;
    this.test = test;
    this.parentError = parentError;
  }

  async log(): Promise<void> {
    const { stepId, breadcrumbs, breakParentIfResult, levelIndent } = this.agent;
    const { PPD_LOG_STEPID } = new Arguments().args;
    await this.logger.log({
      level: 'warn',
      levelIndent,
      text: `Continue: ${this.parentError?.message || `test with expr ${breakParentIfResult}'`}${
        PPD_LOG_STEPID ? `[${stepId}]` : ''
      }`,
      logMeta: { breadcrumbs },
    });
  }
}

export const errorHandler = async (errorIncome: ErrorType): Promise<void> => {
  const error = { ...errorIncome, ...{ message: errorIncome.message, stack: errorIncome.stack } };
  const { PPD_DEBUG_MODE = false } = new Arguments().args;
  if (error.socket?.sendYAML) {
    error.socket.sendYAML({ data: { ...error }, type: error.type || 'error', envsId: error.envsId });
  }

  if (!(errorIncome instanceof TestError)) {
    console.log(errorIncome.message);
    console.log(errorIncome);
  }

  if (PPD_DEBUG_MODE) {
    /* istanbul ignore next */
    if (!process.env.JEST_WORKER_ID) {
      // biome-ignore lint/suspicious/noDebugger: debug mode
      debugger;
    }
  }

  try {
    const runners = new Environment().getEnvRunners(errorIncome.envsId);

    if (runners.closeAllRunners) {
      await runners.closeAllRunners();
    }
  } catch {
    //
  }

  process.exit(1);
};
