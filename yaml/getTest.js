const _ = require('lodash');

const { log } = require('../logger/logger');
const Test = require('../abstractTest');
const atoms = require('../atoms');

const getTest = function(testJson){

  const functions = _.pick(testJson, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);
  const values = _.omit(testJson, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);

  for (let funcKey in functions) {
    testJson[funcKey] = [];

    for (let test of functions[funcKey]){

      if (test.type === 'test'){
        testJson[funcKey].push( getTest(test) );
      }
      if (test.name === 'log'){
        testJson[funcKey].push( async () => { await log(test) });
      }
      if (test.type === 'atom' && test.name !== 'log'){
        testJson[funcKey].push( async () => { await atoms[test.name](test) });
      }

    }
  }

  const test = new Test( testJson );
  return test.run;
}

module.exports = { getTest };