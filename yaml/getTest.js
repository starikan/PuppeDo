const _ = require('lodash');

const { log } = require('../logger/logger');
const Test = require('../abstractTest');
const atoms = require('../atoms');

// console.log(atoms)

const getTest = function(testJson){

  const functions = _.pick(testJson, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);
  const values = _.omit(testJson, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);

  for (let funcKey in functions) {
    testJson[funcKey] = [];
    
    for (let test of functions[funcKey]){
      // console.log(funcKey, test)


      if (test.type === 'test'){
        testJson[funcKey] = async () => { getTest(test) };
      }
      if (test.name === 'log'){
        testJson[funcKey] = async () => { log(test) };
      }
      if (test.type === 'atom' && test.name !== 'log'){
        testJson[funcKey] = async () => { atoms[test.name](test) };
      }
      // console.log(funcKey, testKey)
    }
  }

  // console.log(testJson);
  // debugger;

  const test = new Test( testJson );
  return test.run;
}

module.exports = { getTest };