/* eslint-disable max-classes-per-file */
import { Arguments } from './Arguments';
import { Test } from './Test';
import Log from './Log';
import Environment from './Environment';
import Env from './Env';

import { SocketType } from './global.d';

export interface ErrorType extends Error {
  envsId: string;
  envs: Env;
  socket: SocketType;
  stepId: string;
  testDescription: string;
  descriptionError: string;
  message: string;
  stack: string;
  type: string;
  breadcrumbs: string[];
  breadcrumbsDescriptions: string[];
}

type ErrorTestConstructor = {
  logger: Log;
  parentError: ErrorType;
  test: Test;
  envsId: string;
};

type ErrorContinueParentConstructor = {
  localResults: Record<string, unknown>;
  errorLevel: number;
  logger: Log;
  test: Test;
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
  descriptionError: string;
  testDescription: string;
  message: string;
  stack: string;
  logger: Log;
  test: Test;
  breadcrumbs: string[];
  breadcrumbsDescriptions: string[];

  constructor({ logger, parentError, test, envsId }: ErrorTestConstructor) {
    super();

    this.envsId = parentError?.envsId || envsId;
    this.envs = parentError?.envs || test.env;
    this.socket = parentError?.socket || test.socket;
    this.stepId = parentError?.stepId || test.stepId;
    this.descriptionError = parentError?.descriptionError || test.descriptionError;
    this.testDescription = parentError?.testDescription || test.description;
    this.message = `${parentError?.message} || error in test = ${test.name}`;
    this.stack = parentError?.stack;
    this.breadcrumbs = parentError?.breadcrumbs || test.breadcrumbs;
    this.breadcrumbsDescriptions = parentError?.breadcrumbsDescriptions || test.breadcrumbsDescriptions;

    this.logger = logger;
    this.test = test;
  }

  async log(): Promise<void> {
    const { stepId, funcFile, testFile, levelIndent, continueOnError } = this.test;

    if (!continueOnError) {
      let text = this.descriptionError ? `${this.descriptionError} | ` : '';
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
    const { message = '', descriptionError = '', breadcrumbs = [], breadcrumbsDescriptions = [] } = this;
    const texts = [
      '',
      'SUMMARY ERROR INFO:',
      '',
      `Message:     ${message.split(' || ')[0]}`,
      `Error:       ${descriptionError}`,
      `Path:        ${breadcrumbs.join(' -> ')}`,
      'Description:',
      ...[breadcrumbsDescriptions.map((v, i) => `${' '.repeat((1 + i) * 3)}${v}`)],
      '',
    ];
    for (const text of texts) {
      await this.logger.log({ level: 'error', text, extendInfo: true });
    }
  }
}

export class ContinueParentError extends AbstractError {
  logger: Log;
  test: Test;
  errorLevel: number;
  localResults: Record<string, unknown>;

  constructor({ localResults, errorLevel, logger, test }: ErrorContinueParentConstructor) {
    super();

    this.localResults = localResults;
    this.errorLevel = errorLevel;
    this.logger = logger;
    this.test = test;
  }

  async log(): Promise<void> {
    const { levelIndent, continueIfResult } = this.test;
    await this.logger.log({
      level: 'warn',
      levelIndent,
      text: `Continue test with expr ${continueIfResult}'`,
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
