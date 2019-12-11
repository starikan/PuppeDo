const path = require('path');

const _ = require('lodash');

const abstractTest = require('./abstractTest');

const getTest = function(testJsonIncome, envsId, socket) {
  const { envs } = require('./env')({ envsId, socket });

  // debugger

  let testJson = _.cloneDeep(testJsonIncome);
  if (!testJson || !_.isObject(testJson) || !envsId) {
    throw { message: 'getTest params error' };
  }
  const functions = _.pick(testJson, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);

  // Pass source code of test into test for logging
  testJson.source = {...testJson};

  testJson.socket = socket;

  for (let funcKey in functions) {
    testJson[funcKey] = [];
    let funcVal = functions[funcKey];

    if (_.isArray(funcVal)) {
      for (let test of funcVal) {
        if (['test', 'atom'].includes(test.type)) {
          testJson[funcKey].push(getTest(test, envsId, socket));
        }
      }
    }

    if (_.isString(funcVal)) {
      let funcFile = path.join(envs.get('args.testsFolder'), funcVal);
      try {
        try {
          funcFromFile = _.get(require(funcFile), funcKey);
        } catch (err) {
          // if relative path of testFolder
          funcFile = path.join(process.cwd(), funcFile);
          funcFromFile = _.get(require(funcFile), funcKey);
        }
        if (_.isFunction(funcFromFile)) {
          // Resolve JS file for test for logging
          testJson.funcFile = path.resolve(funcFile);
          testJson[funcKey] = [funcFromFile];
        } else {
          throw {
            message: `Функция по ссылке не найдена ${funcKey} -> ${funcVal}, файл ${funcFile}. Проверьте наличии функции и пути.`,
          };
        }
      } catch (err) {
        console.log(err);
        throw {
          message: `Функция по ссылке не доступна ${funcKey} -> ${funcVal}, файл ${funcFile}. Проверьте наличии функции и пути.`,
        };
      }
    }

    if (!funcVal) {
      // debugger
      const testFileExt = path.parse(testJson.testFile).ext;
      const funcFile = testJson.testFile.replace(testFileExt, '.js');
      try {
        funcFromFile = _.get(require(funcFile), funcKey);
        testJson.funcFile = path.resolve(funcFile);
        testJson[funcKey] = [funcFromFile];
      } catch (error) {
        throw {
          message: `Функция по ссылке не найдена ${funcKey}, файл ${funcFile}. Проверьте наличии функции и пути.`,
        };
      }
    }
  }

  const test = new abstractTest(testJson);
  return async () => {
    await test.run(testJson, envsId);
  };
};

module.exports = { getTest };
