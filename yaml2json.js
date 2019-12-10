const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const yaml = require('js-yaml');
const walkSync = require('walk-sync');

const getAllYamls = ({ testsFolder = '.' }) => {
  console.time('getAllYamls');

  testsFolder = path.normalize(testsFolder);

  let allContent = [];
  let paths = walkSync(testsFolder);
  const exts = ['.yaml', '.yml', '.ppd'];

  // startsWith('.') remove folders like .git
  let allFiles = _.filter(paths, v => !v.startsWith('.') && exts.includes(path.parse(v).ext));

  allFiles.forEach(filePath => {
    try {
      let full = yaml.safeLoadAll(fs.readFileSync(path.join(testsFolder, filePath), 'utf8'));
      for (let v of full) {
        v.filePath = path.join(testsFolder, filePath);
        allContent.push(v);
      }
    } catch (e) {
      throw e;
    }
  });

  let atoms = allContent.filter(v => v.type === 'atom' && v);
  let tests = allContent.filter(v => v.type === 'test' && v);
  let envs = allContent.filter(v => v.type === 'env' && v);
  let data = allContent.filter(v => v.type === 'data' && v);
  let selectors = allContent.filter(v => v.type === 'selectors' && v);

  console.timeEnd('getAllYamls');

  return { allFiles, allContent, atoms, tests, envs, data, selectors };
};

module.exports = { getAllYamls };
