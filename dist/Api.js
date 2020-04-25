var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable no-await-in-loop */
const _ = require('lodash');
const dayjs = require('dayjs');
const { getFullDepthJSON } = require('./getFullDepthJSON');
const { getTest } = require('./getTest');
const { Arguments } = require('./Arguments');
const { Blocker } = require('./Blocker');
const Environment = require('./Environment.js');
const { Log } = require('./Log');
const run = (argsInput = {}) => __awaiter(this, void 0, void 0, function* () {
    let envsId;
    let envs;
    let log;
    try {
        const startTime = new Date();
        const args = new Arguments(argsInput);
        if (_.isEmpty(args.PPD_TESTS)) {
            throw new Error('There is no tests to run. Pass any test in PPD_TESTS argument');
        }
        if (_.isEmpty(args.PPD_ENVS)) {
            throw new Error('There is no environments to run. Pass any test in PPD_ENVS argument');
        }
        const initArgsTime = (new Date() - startTime) / 1000;
        for (let i = 0; i < args.PPD_TESTS.length; i += 1) {
            const startTimeTest = new Date();
            ({ envsId, envs } = Environment({ envsId }));
            envs.initOutput(args.PPD_TESTS[i]);
            envs.set('current.test', args.PPD_TESTS[i]);
            const logger = new Log({ envsId });
            log = logger.log.bind(logger);
            if (i === 0) {
                yield log({ level: 'timer', text: `Init time 🕝: ${initArgsTime} sec.` });
            }
            yield log({
                level: 'timer',
                text: `Test '${args.PPD_TESTS[i]}' start on '${dayjs(startTimeTest).format('YYYY-MM-DD HH:mm:ss.SSS')}'`,
            });
            yield envs.init(false);
            const { fullJSON, textDescription } = getFullDepthJSON({ envsId });
            yield log({ level: 'env', text: `\n${textDescription}`, testStruct: fullJSON });
            const blocker = new Blocker();
            blocker.refresh();
            const test = getTest(fullJSON, envsId);
            yield envs.runBrowsers();
            yield log({
                level: 'timer',
                text: `Prepare time 🕝: ${(new Date() - startTimeTest) / 1000} sec.`,
            });
            yield test();
            yield log({
                level: 'timer',
                text: `Test '${args.PPD_TESTS[i]}' time 🕝: ${(new Date() - startTimeTest) / 1000} sec.`,
            });
        }
        yield envs.closeBrowsers();
        yield envs.closeProcesses();
        yield log({
            level: 'timer',
            text: `Evaluated time 🕝: ${(new Date() - startTime) / 1000} sec.`,
        });
        if (!module.parent) {
            process.exit(1);
        }
    }
    catch (error) {
        error.message += " || error in 'run'";
        if (String(error).startsWith('SyntaxError')) {
            error.debug = true;
            error.type = 'SyntaxError';
        }
        throw error;
    }
});
module.exports = {
    run,
};
//# sourceMappingURL=Api.js.map