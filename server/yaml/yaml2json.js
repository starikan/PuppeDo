const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const yaml = require('js-yaml');
const walkSync = require('walk-sync');

const yaml2json = async function(filePath, testsFolders = []){

  if (!_.isString(filePath)){
    throw({
      message: `yaml2json: Incorrect file name YAML/JSON/JS - ${filePath}`
    });
  }

  let isTestExist = fs.existsSync(filePath);

  let exts = ['.yaml', '.json', '.js'];
  let files = [];
  let testFile = null;
  let allTestFolders = _.clone(testsFolders);
  testsFolders.forEach(folder => {
    var paths = walkSync(folder);
    allTestFolders = allTestFolders.concat(paths.filter(p => p.endsWith('/')).map(p => path.join(folder, p).replace(/\\/g, '\\\\')));
  });

  if (!isTestExist){
    [filePath, path.basename(filePath)].forEach(file => {
      files.push(file);
      exts.forEach(ext => {
        files.push(file + ext);
        allTestFolders.forEach(folder => {
          files.push('.\\' + path.join(folder, file + ext));
        })
      })
    })
  }

  for (let file of files) {
    try {
      if (fs.existsSync(file)) {
        testFile = file;
        break;
      }
    }
    catch (err) {}
  }

  let full = {};

  if (!testFile){
    full = { name: testFile };
    return { json: full };
  }

  if (testFile && testFile.endsWith('.json')){
    try {
      full = require(testFile);
      return { json: full };
    } catch (e) {
      throw(e);
    }
  }

  // todo
  if (testFile && testFile.endsWith('.js')){
    return { json: testFile };
  }

  if (testFile && testFile.endsWith('.yaml')){
    try {
      full = yaml.safeLoad(fs.readFileSync(testFile, 'utf8'));
      return { json: full };
    } catch (e) {
      throw(e);
    }
  }

  throw({
    message: `YAML/JSON: Incorrect file name YAML/JSON - ${testFile}`
  });
}

module.exports = { yaml2json };