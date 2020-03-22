const path = require('path');

const _ = require('lodash');

const { Blocker } = require('./Blocker');
const { blankSocket } = require('./Helpers.js');
const AbstractTest = require('./AbstractTest.js');

const RUNNER_BLOCK_NAMES = ['beforeTest', 'runTest', 'afterTest', 'errorTest'];

const resolveJS = (testJson, funcFile) => {
  const testJsonNew = { ...testJson };
  try {
    /* eslint-disable */
    const atom = require(funcFile);
    /* eslint-enable */
    const { runTest } = atom;
    if (_.isFunction(runTest)) {
      testJsonNew.funcFile = path.resolve(funcFile);
      testJsonNew.runTest = [runTest];
    }
  } catch (err) {
    // If there is no JS file it`s fine.
    testJsonNew.funcFile = 'No file';
    testJsonNew.runTest = [() => {}];
  }
  return testJsonNew;
};

const getTest = (testJsonIncome, envsId, socket = blankSocket) => {
  if (!testJsonIncome || !_.isObject(testJsonIncome) || !envsId) {
    throw new Error('getTest params error');
  }
  let testJson = { ...testJsonIncome };
  const functions = _.pick(testJson, RUNNER_BLOCK_NAMES);

  // Pass source code of test into test for logging
  testJson.source = { ...testJsonIncome };

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
  } else {
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
      } else {
        throw new Error(`Block ${funcKey} must be array. Path: '${testJson.breadcrumbs.join(' -> ')}'`);
      }
    });
  }

  const test = new AbstractTest(testJson);

  return async () => {
    await test.run(testJson, envsId);
  };
};

module.exports = { getTest };
