const _ = require('lodash');
const walkSync = require('walk-sync');

let atoms = {};
var paths = walkSync('./server/atoms');

paths.forEach(p => {
  let nameFile = p.split('.')[0];
  if (nameFile && nameFile != 'index'){
    atoms[nameFile] = require('./' + nameFile);
  }
});

module.exports = atoms;

// module.exports = {
//   'typeInput': require('./typeInput'),
//   'buttonClick': require('./buttonClick'),
//   'goTo': require('./goTo'),
//   'checkSelector': require('./checkSelector'),
//   'if': require('./if'),
// };