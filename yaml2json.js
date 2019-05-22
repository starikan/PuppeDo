const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const yaml = require('js-yaml');
const walkSync = require('walk-sync');

// Only one time read files from disk
let paths;

const yaml2json = function(filePath, testsFolder = '') {
  if (!_.isString(filePath)) {
    throw { message: `yaml2json: Incorrect file name YAML/JSON/JS - ${filePath}` };
  }

  let isTestExist = fs.existsSync(filePath);
  let exts = ['.yaml', '.json', '.js'];
  let files = [];
  let testFile = null;
  //TODO: 2019-05-22 S.Starodubov path.normalize
  testsFolder = testsFolder.replace(/\\/g, '\\\\');
  let allTestFolders = [];

  if (!paths) {
    paths = walkSync(testsFolder);
  }

  paths.forEach(folder => {
    if (folder.includes('.git')) {
      return;
    }
    if (folder.endsWith('/') || folder.endsWith('\\')) {
      allTestFolders.push(folder);
    }
  });

  if (!isTestExist) {
    [filePath, path.basename(filePath)].forEach(file => {
      files.push(file);
      exts.forEach(ext => {
        files.push(file + ext);
        allTestFolders.forEach(folder => {
          files.push(path.join(testsFolder, folder, file + ext));
        });
      });
    });
  }

  if (filePath != 'log') {
    for (let file of files) {
      try {
        if (fs.existsSync(file)) {
          testFile = file;
          break;
        }
      } catch (err) {}
    }
  }

  let full = {};

  if (!testFile) {
    if (filePath != 'log') {
      throw { message: `Can't find test file '${filePath}' in folder '${testsFolder}'` };
    }
    full = { name: testFile };
    return { json: full };
  }

  if (testFile && testFile.endsWith('.json')) {
    try {
      full = require(testFile);
      return { json: full };
    } catch (e) {
      throw e;
    }
  }

  // TODO:
  if (testFile && testFile.endsWith('.js')) {
    return { json: testFile };
  }

  if (testFile && testFile.endsWith('.yaml')) {
    try {
      full = yaml.safeLoad(fs.readFileSync(testFile, 'utf8'));
      return { json: full };
    } catch (e) {
      throw e;
    }
  }

  throw { message: `YAML/JSON: Incorrect file name YAML/JSON - ${testFile}` };
};

const getAllYamls = async ({ testsFolder = '.', envsId }) => {
  console.time('getAllYamls');

  testsFolder = path.normalize(testsFolder);

  let allContent = {};
  let paths = walkSync(testsFolder);
  // !startsWith('.') remove folders like .git
  let files = _.filter(paths, v => !v.startsWith('.') && v.endsWith('.yaml'));

  files.forEach(filePath => {
    try {
      let full = yaml.safeLoad(fs.readFileSync(path.join(testsFolder, filePath), 'utf8'));
      allContent[filePath] = full;
    } catch (e) {
      throw e;
    }
  });

  console.timeEnd('getAllYamls');

  return { paths, allContent };
};

module.exports = { yaml2json, getAllYamls };
