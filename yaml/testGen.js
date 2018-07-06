const yaml = require('js-yaml');
const fs = require('fs');

// Get document, or throw exception on error
try {
  var doc = yaml.safeLoad(fs.readFileSync('/login.yml', 'utf8'));
  console.log(doc);
} catch (e) {
  console.log(e);
}