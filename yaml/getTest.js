const path = require('path');

const _ = require('lodash');

const abstractTest = require('../abstractTest');

const getTest = function(testJson, envsId){

  if (!testJson || !_.isObject(testJson) || !envsId){
    throw({
      message: 'getTest params error'
    })
  }

  const functions = _.pick(testJson, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);
  const { envs, log } = require('../env')(envsId);

  for (let funcKey in functions) {

    testJson[funcKey] = [];
    let funcVal = functions[funcKey];

    if (_.isArray(funcVal)){
      for (let test of funcVal){
        if (test.type === 'test'){
          testJson[funcKey].push( getTest(test, envsId) );
        }
        if (test.name === 'log'){
          testJson[funcKey].push( async () => { await log(test) });
        }
      }
    }

    if ( _.isString(funcVal) ){
      try {
        let funcFile = path.join(process.cwd(), envs.get('args.testsFolder'), funcVal);
        funcFromFile = _.get(require(funcFile), funcKey);
        if (_.isFunction(funcFromFile)){
          testJson[funcKey] = [ funcFromFile ];
        }
        else {
          throw ({ message: `Функция по ссылке не найдена ${funcKey} -> ${funcVal}` })
        }
      }
      catch (err) {
        throw({ message: `Функция по ссылке не доступна ${funcKey} -> ${funcVal}` })
      }
    }
  }

  const test = new abstractTest( testJson );
  return async () => { await test.run(testJson, envsId)};
}

module.exports = { getTest };