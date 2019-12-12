const path = require('path');

const _ = require('lodash');

const abstractTest = require('./abstractTest');
const RUNNER_BLOCK_NAMES = ['beforeTest', 'runTest', 'afterTest', 'errorTest'];

const getTest = function(testJsonIncome, envsId, socket) {
  const { envs } = require('./env')({ envsId, socket });

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
    const funcKey = 'runTest';
    const testFileExt = path.parse(testJson.filePath).ext;
    const funcFile = path.resolve(testJson.filePath.replace(testFileExt, '.js'));
    try {
      const funcFromFile = _.get(require(funcFile), funcKey);
      testJson.funcFile = path.resolve(funcFile);
      testJson[funcKey] = [funcFromFile];
    } catch (error) {
      // If there is no JS file it`s fine.
    }
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
      }

      if (_.isString(funcVal)) {
        let funcFile = path.resolve(path.join(envs.get('args.testsFolder'), funcVal));
        try {
          funcFromFile = _.get(require(funcFile), funcKey);
          if (_.isFunction(funcFromFile)) {
            testJson.funcFile = path.resolve(funcFile);
            testJson[funcKey] = [funcFromFile];
          }
        } catch (err) {
          throw {
            message: `Функция по ссылке не найдена ${funcKey} -> ${funcVal}, файл ${funcFile}. Проверьте наличии функции и пути.`,
          };
        }
      }
    }
  }

  const test = new abstractTest(testJson);
  return async () => {
    await test.run(testJson, envsId);
  };
};

module.exports = { getTest };
