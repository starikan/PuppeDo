const _ = require('lodash');

const abstractTest = require('../abstractTest');

const getTest = function(testJson, envsId){

  if (!testJson || !_.isObject(testJson) || !envsId){
    throw({
      message: 'getTest params error'
    })
  }

  const functions = _.pick(testJson, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);

  for (let funcKey in functions) {
    testJson[funcKey] = [];

    if (_.isArray(functions[funcKey])){
      for (let test of functions[funcKey]){
        if (test.type === 'test'){
          const testFunc = _.get(test, funcKey);
          let newTest;
          if ( _.isString(testFunc) ){
            try {
              funcFromFile = _.get(require('../' + testFunc), funcKey);
              if (_.isFunction(funcFromFile)){
                test[funcKey] = funcFromFile;
                const abstractTest = require('../abstractTest');
                const abstractTestDone = new abstractTest( test );
                newTest = async () => { 
                  await abstractTestDone.run(test, envsId) 
                };
              }
              else {
                throw ({
                  message: `Функция по ссылке не найдена ${funcKey} -> ${testFunc}`
                })
              }
            }
            catch (err) {
              throw({
                message: `Функция по ссылке не доступна ${funcKey} -> ${testFunc}`
              })
            }
          }
          else {
            newTest = getTest(test, envsId);
          }

          testJson[funcKey].push( newTest );
        }
        if (test.name === 'log'){
          const { log } = require('../env.js')(envsId);
          testJson[funcKey].push( async () => { await log(test) });
        }
      }
    }
  }

  const test = new abstractTest( testJson );
  return async () => { await test.run(testJson, envsId)};
}

module.exports = { getTest };