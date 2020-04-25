var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable max-classes-per-file */
// declare function require(name: string);
require('source-map-support').install();
const { Arguments } = require('./Arguments.js');
class AbstractError extends Error {
    constructor() {
        super();
        this.name = this.constructor.name;
    }
}
class TestError extends AbstractError {
    constructor({ logger = {
        log: () => {
            throw new Error('No log function');
        },
    }, parentError = {}, test = {}, envsId = null, }) {
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
    log() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.logger.log({
                level: 'error',
                text: `Description: ${this.test.description || 'No test description'} (${this.test.name})`,
                screenshot: false,
                stepId: this.test.stepId,
                funcFile: this.test.funcFile,
                testFile: this.test.testFile,
                levelIndent: this.test.levelIndent,
                error: this,
            });
        });
    }
}
const errorHandler = (errorIncome) => __awaiter(this, void 0, void 0, function* () {
    const error = Object.assign(Object.assign({}, errorIncome), { message: errorIncome.message, stack: errorIncome.stack });
    const { PPD_DEBUG_MODE = false } = new Arguments();
    if (error.socket && error.socket.sendYAML) {
        error.socket.sendYAML({ data: Object.assign({}, error), type: error.type || 'error', envsId: error.envsId });
    }
    if (!(errorIncome instanceof TestError)) {
        // eslint-disable-next-line no-console
        console.log(errorIncome);
    }
    if (PPD_DEBUG_MODE) {
        // eslint-disable-next-line no-debugger
        debugger;
    }
    const { envs } = errorIncome;
    if (envs) {
        yield envs.closeBrowsers();
        yield envs.closeProcesses();
    }
    // if (!module.parent) {
    process.exit(1);
    // }
});
module.exports = {
    errorHandler,
    AbstractError,
    TestError,
};
//# sourceMappingURL=Error.js.map