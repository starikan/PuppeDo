const Test = require('../abstractTest');

const test = new Test(
  {
    name: 'if',
    type: 'atom',
  }
)

module.exports = test.run;