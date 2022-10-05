/* eslint-disable max-classes-per-file */
import { Arguments } from './Arguments';
import { Test } from './Test';
import Log from './Log';
import Environment from './Environment';
import Env from './Env';

import { SocketType } from './global.d';
import { PluginContinueOnError, PluginDescriptionError } from './Plugins';

export interface ErrorType extends Error {
  envsId: string;
  envs: Env;
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
};

type ErrorContinueParentConstructor = {
  localResults: Record<string, unknown>;
  errorLevel: number;
  logger: Log;
  test: Test;
  parentError?: ErrorType;
};

export class AbstractError extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
  }
}

export class TestError extends AbstractError {
  envsId: string;
  envs: Env;
  socket: SocketType;
  stepId: string;
  testDescription: string;
  message: string;
  stack: string;
  logger: Log;
  test: Test;
  parentTest: Test;
  breadcrumbs: string[];
  breadcrumbsDescriptions: string[];

  constructor({ logger, parentError, test }: ErrorTestConstructor) {
    super();

    this.envsId = parentError?.envsId || test.envsId;
    this.envs = parentError?.envs || test.env;
    this.socket = parentError?.socket || test.socket;
    this.stepId = parentError?.stepId || test.stepId;
    this.testDescription = parentError?.testDescription || test.description;
    this.message = `${parentError?.message} || error in test = ${test.name}`;
    this.stack = parentError?.stack;
    this.breadcrumbs = parentError?.breadcrumbs || test.breadcrumbs;
    this.breadcrumbsDescriptions = parentError?.breadcrumbsDescriptions || test.breadcrumbsDescriptions;

    this.logger = logger;
    this.test = test;
    this.parentTest = parentError?.test;
  }

  getDescriptionError(): string {
    const parentDescriptionError =
      this.parentTest?.plugins.getValue<PluginDescriptionError>('descriptionError').descriptionError ?? '';
    const currentDescriptionError =
      this.test.plugins.getValue<PluginDescriptionError>('descriptionError').descriptionError;
    const result = parentDescriptionError || currentDescriptionError;
    return result;
  }

  async log(): Promise<void> {
    const { stepId, funcFile, testFile, levelIndent } = this.test;
    const { continueOnError } = this.test.plugins.getValue<PluginContinueOnError>('continueOnError');

    if (!continueOnError) {
      let text = this.getDescriptionError() ? `${this.getDescriptionError()} | ` : '';
      text += `Description: ${this.test.description || 'No test description'} (${this.test.name})`;
      await this.logger.log({
        level: 'error',
        text,
        screenshot: false,
        stepId,
        funcFile,
        testFile,
        levelIndent,
        error: this,
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
    await this.logger.log({ level: 'error', text, extendInfo: true });
  }
}

export class ContinueParentError extends AbstractError {
  logger: Log;
  test: Test;
  errorLevel: number;
  localResults: Record<string, unknown>;
  parentError?: ErrorType;

  constructor({ localResults, errorLevel, logger, test, parentError }: ErrorContinueParentConstructor) {
    super();

    this.localResults = localResults;
    this.errorLevel = errorLevel;
    this.logger = logger;
    this.test = test;
    this.parentError = parentError;
  }

  async log(): Promise<void> {
    const { levelIndent, breakParentIfResult } = this.test;
    await this.logger.log({
      level: 'warn',
      levelIndent,
      text: `Continue: ${this.parentError?.message || `test with expr ${breakParentIfResult}'`}`,
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

  const { envsPool } = Environment(errorIncome.envsId);

  if (envsPool.closeAllEnvs) {
    await envsPool.closeAllEnvs();
  }

  process.exit(1);
};
