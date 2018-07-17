const _ = require('lodash');
const walkSync = require('walk-sync');

let atoms = {};
var paths = walkSync('./atoms');

paths.forEach(p => {
  let nameFile = p.split('.')[0];
  if (nameFile && nameFile != 'index'){
    console.log(nameFile)
    atoms[nameFile] = require('./' + nameFile);
  }
});

console.log(atoms)

module.exports = atoms;

// module.exports = {
//   'typeInput': require('./typeInput'),
//   'buttonClick': require('./buttonClick'),
//   'goTo': require('./goTo'),
//   'checkSelector': require('./checkSelector'),
//   'if': require('./if'),
// };