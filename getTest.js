const path = require('path');

const _ = require('lodash');

const abstractTest = require('./abstractTest');
const RUNNER_BLOCK_NAMES = ['beforeTest', 'runTest', 'afterTest', 'errorTest'];

const resolveJS = (testJson, funcFile) => {
  try {
    const funcFromFile = _.get(require(funcFile), 'runTest');
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

const getTest = function(testJsonIncome, envsId, socket) {
  let testJson = { ...testJsonIncome };
  if (!testJson || !_.isObject(testJson) || !envsId) {
    throw { message: 'getTest params error' };
  }
  const functions = _.pick(testJson, RUNNER_BLOCK_NAMES);

  // Pass source code of test into test for logging
  testJson.source = { ...testJsonIncome };

  testJson.socket = socket;

  // If there is no any function in test we deside that it have runTest in js file with the same name
  if (!Object.keys(functions).length && ['atom'].includes(testJson.type)) {
    const testFileExt = path.parse(testJson.filePath).ext;
    const funcFile = path.resolve(testJson.filePath.replace(testFileExt, '.js'));
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
