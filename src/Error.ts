import { Arguments } from './Arguments';
import { Test } from './Test';
import { Log } from './Log';
import { Environment, Runner } from './Environment';

import { AgentData, SocketType } from './global.d';
import { PluginContinueOnError, PluginDescriptionError } from './Plugins';

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
  test: Test;
  agent: AgentData;
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
  test: Test;
  agent: AgentData;
  parentTest: Test;
  breadcrumbs: string[];
  breadcrumbsDescriptions: string[];

  // TODO: избавиться от test тут
  constructor({ logger, parentError, test, agent }: ErrorTestConstructor) {
    super();

    this.agent = agent;

    this.envsId = parentError?.envsId || this.agent.envsId;
    this.runners = parentError?.runners || test.runner;
    this.socket = parentError?.socket || this.agent.socket;
    this.stepId = parentError?.stepId || this.agent.stepId;
    this.testDescription = parentError?.testDescription || this.agent.description;
    this.message = `${parentError?.message} || error in test = ${this.agent.name}`;
    this.stack = parentError?.stack;
    this.breadcrumbs = parentError?.breadcrumbs || this.agent.breadcrumbs;
    this.breadcrumbsDescriptions = parentError?.breadcrumbsDescriptions || this.agent.breadcrumbsDescriptions;

    this.logger = logger;
    this.test = test;
    this.parentTest = parentError?.test;
  }

  getDescriptionError(): string {
    const parentDescriptionError =
      this.parentTest?.plugins.getValue<PluginDescriptionError>('descriptionError').descriptionError ?? '';
    const currentDescriptionError =
      this.test.plugins.getValue<PluginDescriptionError>('descriptionError').descriptionError;
    const result = currentDescriptionError || parentDescriptionError;
    return result;
  }

  async log(): Promise<void> {
    const { stepId, breadcrumbs, funcFile, testFile, levelIndent } = this.agent;
    const { continueOnError } = this.test.plugins.getValue<PluginContinueOnError>('continueOnError');

    if (!continueOnError) {
      let text = this.getDescriptionError() ? `${this.getDescriptionError()} | ` : '';
      // TODO: 2022-10-06 S.Starodubov BUG bindDescription not work
      text += `Description: ${this.agent.description || 'No test description'} (${this.agent.name})`;
      await this.logger.log({
        level: 'error',
        text,
        stepId,
        levelIndent,
        error: this,
        logMeta: { funcFile, testFile, breadcrumbs },
        logOptions: { screenshot: false },
      });
    }

    if (levelIndent === 0 || continueOnError) {
      await this.summaryInfo();
    }
  }

  async summaryInfo(): Promise<void> {
    const { message = '', breadcrumbs = [], breadcrumbsDescriptions = [] } = this;
    const text = [
      `█ SUMMARY ERROR INFO:
                      █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                      █ Message:     ${message.split(' || ')[0]}
                      █ Error:       ${this.getDescriptionError()}
                      █ Path:        ${breadcrumbs.join(' -> ')}
                      █ Description:`,
      ...breadcrumbsDescriptions.map((v, i) => `                      █ ${' '.repeat((1 + i) * 3)}${v}`),
    ].join('\n');
    await this.logger.log({ level: 'error', text, logMeta: { extendInfo: true } });
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
  if (error.socket && error.socket.sendYAML) {
    error.socket.sendYAML({ data: { ...error }, type: error.type || 'error', envsId: error.envsId });
  }

  if (!(errorIncome instanceof TestError)) {
    console.log(errorIncome.message);
    console.log(errorIncome);
  }

  if (PPD_DEBUG_MODE) {
    // eslint-disable-next-line no-debugger
    debugger;
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
