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
  message: string;
  stack: string;
  type: string;
}

type ErrorConstructorType = {
  logger: Log;
  parentError: ErrorType;
  test: Test;
  envsId: string;
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

  constructor({ logger, parentError, test, envsId }: ErrorConstructorType) {
    super();

    this.envsId = parentError?.envsId || envsId;
    this.envs = parentError?.envs || test.env;
    this.socket = parentError?.socket || test.socket;
    this.stepId = parentError?.stepId || test.stepId;
    this.testDescription = parentError?.testDescription || test.description;
    this.message = `${parentError?.message} || error in test = ${test.name}`;
    this.stack = parentError?.stack;

    this.logger = logger;
    this.test = test;
  }

  async log(): Promise<void> {
    await this.logger.log({
      level: 'error',
      text: `Description: ${this.test.description || 'No test description'} (${this.test.name})`,
      screenshot: false,
      stepId: this.test.stepId,
      funcFile: this.test.funcFile,
      testFile: this.test.testFile,
      levelIndent: this.test.levelIndent,
      error: this,
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
    console.log(errorIncome);
  }
  if (PPD_DEBUG_MODE) {
    // eslint-disable-next-line no-debugger
    debugger;
  }

  const { envsPool } = Environment(errorIncome.envsId);

  if (envsPool.closeBrowsers) {
    await envsPool.closeBrowsers();
  }
  if (envsPool.closeProcesses) {
    await envsPool.closeProcesses();
  }

  // if (!module.parent) {
  process.exit(1);
  // }
};
