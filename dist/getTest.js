var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const path = require('path');
const _ = require('lodash');
const { Blocker } = require('./Blocker');
const { blankSocket, merge } = require('./Helpers.js');
const AbstractTest = require('./AbstractTest.js');
const RUNNER_BLOCK_NAMES = ['beforeTest', 'runTest', 'afterTest', 'errorTest'];
const resolveJS = (testJson, funcFile) => {
    const testJsonNew = Object.assign({}, testJson);
    try {
        /* eslint-disable */
        const atom = require(funcFile);
        /* eslint-enable */
        const { runTest } = atom;
        if (_.isFunction(runTest)) {
            testJsonNew.funcFile = path.resolve(funcFile);
            testJsonNew.runTest = [runTest];
        }
    }
    catch (err) {
        // If there is no JS file it`s fine.
        testJsonNew.funcFile = 'No file';
        testJsonNew.runTest = [() => { }];
    }
    return testJsonNew;
};
const propagateArgumentsOnAir = (source = {}, args = {}, list = []) => {
    const result = Object.assign({}, source);
    list.forEach((v) => {
        result[v] = merge(result[v] || {}, args[v] || {});
    });
    return result;
};
const getTest = (testJsonIncome, envsId, socket = blankSocket) => {
    if (!testJsonIncome || !_.isObject(testJsonIncome) || !envsId) {
        throw new Error('getTest params error');
    }
    let testJson = Object.assign({}, testJsonIncome);
    const functions = _.pick(testJson, RUNNER_BLOCK_NAMES);
    // Pass source code of test into test for logging
    testJson.source = Object.assign({}, testJsonIncome);
    testJson.socket = socket;
    const blocker = new Blocker();
    blocker.push({ stepId: testJson.stepId, block: false, breadcrumbs: testJson.breadcrumbs });
    // Test
    // blocker.push({ stepId: testJson.stepId, block: true, breadcrumbs: testJson.breadcrumbs });
    // If there is no any function in test we decide that it have runTest in js file with the same name
    if (!Object.keys(functions).length && ['atom'].includes(testJson.type)) {
        const testFileExt = path.parse(testJson.testFile).ext;
        const funcFile = path.resolve(testJson.testFile.replace(testFileExt, '.js'));
        testJson = resolveJS(testJson, funcFile);
    }
    else {
        Object.entries(functions).forEach((v) => {
            const [funcKey, funcVal] = v;
            // Resolve nested
            if (_.isArray(funcVal)) {
                testJson[funcKey] = [];
                funcVal.forEach((test) => {
                    if (['test', 'atom'].includes(test.type)) {
                        testJson[funcKey].push(getTest(test, envsId, socket));
                    }
                });
            }
            else {
                throw new Error(`Block ${funcKey} must be array. Path: '${testJson.breadcrumbs.join(' -> ')}'`);
            }
        });
    }
    const test = new AbstractTest(testJson);
    return (args) => __awaiter(this, void 0, void 0, function* () {
        const updatetTestJson = propagateArgumentsOnAir(testJson, args, ['options']);
        yield test.run(updatetTestJson, envsId);
    });
};
module.exports = { getTest };
//# sourceMappingURL=getTest.js.map