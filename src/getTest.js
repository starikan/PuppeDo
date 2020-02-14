const path = require('path');

const _ = require('lodash');

const { Blocker } = require('./Blocker');
const { blankSocket } = require('./helpers');
const abstractTest = require('./abstractTest');

const RUNNER_BLOCK_NAMES = ['beforeTest', 'runTest', 'afterTest', 'errorTest'];

const resolveJS = (testJson, funcFile) => {
  try {
    const atom = require(funcFile);
    const funcFromFile = _.get(atom, 'runTest');
    if (_.isFunction(funcFromFile)) {
      testJson.funcFile = path.resolve(funcFile);
      testJson['runTest'] = [funcFromFile];
    }
  } catch (err) {
    // If there is no JS file it`s fine.
    testJson.funcFile = 'No file';
    testJson['runTest'] = [() => {}];
  }
  return testJson;
};

const getTest = function(testJsonIncome, envsId, socket = blankSocket) {
  let testJson = { ...testJsonIncome };
  if (!testJson || !_.isObject(testJson) || !envsId) {
    throw { message: 'getTest params error' };
  }
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
    for (let funcKey in functions) {
      let funcVal = functions[funcKey];

      // Resolve nested
      if (_.isArray(funcVal)) {
        testJson[funcKey] = [];
        for (let test of funcVal) {
          if (['test', 'atom'].includes(test.type)) {
            testJson[funcKey].push(getTest(test, envsId, socket));
          }
        }
      } else {
        throw { message: `Block ${funcKey} must be array. Path: '${testJson.breadcrumbs.join(' -> ')}'` };
      }
    }
  }

  const test = new abstractTest(testJson);

  return async () => {
    await test.run(testJson, envsId);
  };
};

module.exports = { getTest };
