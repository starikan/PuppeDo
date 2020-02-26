/* eslint-disable max-classes-per-file */
const { Arguments } = require('./Arguments.js');

const errorHandler = async (errorIncome) => {
  const error = { ...errorIncome, ...{ message: errorIncome.message, stack: errorIncome.stack } };
  const { PPD_DEBUG_MODE = false } = new Arguments();
  if (error.socket && error.socket.sendYAML) {
    error.socket.sendYAML({ data: { ...error }, type: error.type || 'error', envsId: error.envsId });
  }
  if (PPD_DEBUG_MODE) {
    // eslint-disable-next-line no-debugger
    debugger;
  }
  // if (!module.parent) {
  process.exit(1);
  // }
};

class AbstractError extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
  }
}

class TestError extends AbstractError {
  constructor({
    logger = {
      log: () => {
        throw new Error('No log function');
      },
    },
    parentError = {},
    test = {},
    envsId = null,
  }) {
    super();

    this.envsId = parentError.envsId || envsId;
    this.envs = parentError.envs || test.envs;
    this.socket = parentError.socket || test.socket;
    this.stepId = parentError.stepId || test.stepId;
    this.testDescription = parentError.testDescription || test.description;
    this.message = `${parentError.message} || error in test = ${test.name}`;
    this.stack = parentError.stack;

    this.logger = logger;
    this.test = test;
  }

  async log() {
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

module.exports = {
  errorHandler,
  AbstractError,
  TestError,
};
