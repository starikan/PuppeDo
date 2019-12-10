const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const yaml = require('js-yaml');
const walkSync = require('walk-sync');

// Only one time read files from disk
// let allContent;
// let allFiles;
let paths;

const yaml2json = function(filePath, testsFolder = '.') {
  if (!_.isString(filePath)) {
    throw { message: `yaml2json: Incorrect file name YAML: "${filePath}". Must be string.` };
  }

  testsFolder = path.normalize(testsFolder);

  // if (!allContent) {
  //   const yamls = getAllYamls({ testsFolder });
  //   allContent = yamls.allContent;
  //   allFiles = yamls.allFiles;
  // }

  // const fileContent = allContent.find(v => v.filePath.includes(filePath + '.yaml'));
  // if (!fileContent) {
  //   debugger
  //   if (filePath !== 'log') {
  //     throw { message: `Can't find test file '${filePath}' in folder '${testsFolder}'` };
  //   }
  //   return {
  //     json: {
  //       name: filePath,
  //     },
  //   };
  // }

  // return { json: fileContent };

  let isTestExist = fs.existsSync(filePath);
  let exts = ['.yaml', '.yml', '.ppd'];
  let files = [];
  let testFile = null;
  let allTestFolders = [];

  if (!paths) {
    paths = walkSync(testsFolder);
  }

  paths.forEach(folder => {
    if (
      folder.includes('.git') ||
      folder.includes('node_modules') ||
      folder.includes('.history') ||
      folder.includes('output')
    ) {
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

  // if (!testFile) {
  //   if (filePath != 'log') {
  //     throw { message: `Can't find test file '${filePath}' in folder '${testsFolder}'` };
  //   }
  //   full = { name: testFile };
  //   return { json: full };
  // }

  // if (testFile && testFile.endsWith('.json')) {
  //   try {
  //     full = require(testFile);
  //     return { json: full };
  //   } catch (e) {
  //     throw e;
  //   }
  // }

  // // TODO:
  // if (testFile && testFile.endsWith('.js')) {
  //   return { json: testFile };
  // }

  if (testFile && testFile.endsWith('.yaml')) {
    try {
      full = yaml.safeLoad(fs.readFileSync(testFile, 'utf8'));
      full.testFile = path.resolve(testFile);
      return { json: full };
    } catch (e) {
      throw e;
    }
  }

  throw { message: `YAML/JSON: Incorrect file name YAML/JSON - '${testFile}' associated with '${filePath}'` };
};

const getAllYamls = ({ testsFolder = '.', envsId }) => {
  console.time('getAllYamls');

  testsFolder = path.normalize(testsFolder);

  let allContent = [];
  let paths = walkSync(testsFolder);
  // !startsWith('.') remove folders like .git
  let allFiles = _.filter(paths, v => !v.startsWith('.') && v.endsWith('.yaml'));

  allFiles.forEach(filePath => {
    try {
      let full = yaml.safeLoad(fs.readFileSync(path.join(testsFolder, filePath), 'utf8'));
      full.filePath = path.join(testsFolder, filePath);
      allContent.push(full);
    } catch (e) {
      throw e;
    }
  });

  // const fileNames = allFiles.map(v => {
  //   return path.parse(v).name;
  // });

  let atoms = allContent.filter(v => v.type === 'atom' && v);
  let tests = allContent.filter(v => v.type === 'test' && v);
  let envs = allContent.filter(v => v.type === 'env' && v);
  let data = allContent.filter(v => v.type === 'data' && v);
  let selectors = allContent.filter(v => v.type === 'selectors' && v);

  console.timeEnd('getAllYamls');

  return { allFiles, allContent, atoms, tests, envs, data, selectors };
};

module.exports = { yaml2json, getAllYamls };
