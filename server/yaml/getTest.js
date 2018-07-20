const _ = require('lodash');

const abstractTest = require('../abstractTest');
const atoms = require('../atoms');

const getTest = function(testJson, envsId){

  if (!testJson || !_.isObject(testJson) || !envsId){
    throw({
      message: 'getTest params error'
    })
  }
  
  const functions = _.pick(testJson, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);
  
  for (let funcKey in functions) {
    testJson[funcKey] = [];
    
    for (let test of functions[funcKey]){
      
      if (test.type === 'test'){
        let newTest = getTest(test, envsId);
        testJson[funcKey].push( newTest );
      }
      if (test.name === 'log'){
        const { log } = require('../env.js')(envsId);
        testJson[funcKey].push( async () => { await log(test) });
      }
      if (test.type === 'atom' && test.name !== 'log'){
        testJson[funcKey].push( async () => { await atoms[test.name](test, envsId) });
      }
    }
  }

  const test = new abstractTest( testJson );
  return async () => { await test.run(testJson, envsId)};
}

module.exports = { getTest };