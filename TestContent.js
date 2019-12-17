const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const walkSync = require('walk-sync');
const yaml = require('js-yaml');

const { Singleton } = require('./singleton');

class TestsContent extends Singleton {
  constructor({ rootFolder = process.cwd(), additionalFolders = [], ignorePaths = null } = {}) {
    super();
    this.allData = this.allData || null;
    this.rootFolder = this.rootFolder || rootFolder;
    this.additionalFolders = this.additionalFolders || additionalFolders;
    this.ignorePaths = this.ignorePaths || ignorePaths;
  }

  setRootFolder(rootFolder) {
    this.rootFolder = rootFolder;
  }

  setAdditionalFolders(additionalFolders = []) {
    this.additionalFolders = additionalFolders;
  }

  async getAllData(force = false) {
    if (force || !this.allData) {
      console.time('getAllData');

      const rootFolder = path.normalize(this.rootFolder);

      // TODO: additionalFolders, ignorePaths

      const allContent = [];
      const exts = ['.yaml', '.yml', '.ppd'];
      const paths = walkSync(rootFolder);

      // startsWith('.') remove folders like .git
      const allFiles = _.filter(paths, v => !v.startsWith('.') && exts.includes(path.parse(v).ext));

      allFiles.forEach(filePath => {
        try {
          const full = yaml.safeLoadAll(fs.readFileSync(path.join(rootFolder, filePath), 'utf8'));
          for (let v of full) {
            v.filePath = path.join(rootFolder, filePath);
            allContent.push(v);
          }
        } catch (e) {
          throw e;
        }
      });

      const atoms = allContent.filter(v => v.type === 'atom' && v);
      const tests = allContent.filter(v => v.type === 'test' && v);
      const envs = allContent.filter(v => v.type === 'env' && v);
      const data = allContent.filter(v => v.type === 'data' && v);
      const selectors = allContent.filter(v => v.type === 'selectors' && v);

      // TODO: выкидывать ошибку если есть дубликаты

      console.timeEnd('getAllData');

      this.allData = { allFiles, allContent, atoms, tests, envs, data, selectors };

      return this.allData;
    } else {
      return this.allData;
    }
  }
}

module.exports = {
  TestsContent,
};