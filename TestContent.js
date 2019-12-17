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
    this.ignorePaths = this.ignorePaths || ignorePaths;
    this.setRootFolder(rootFolder);
    this.setAdditionalFolders(additionalFolders);
  }

  setRootFolder(rootFolder) {
    this.rootFolder = this.rootFolder || rootFolder;
    this.rootFolder = path.normalize(this.rootFolder);
  }

  setAdditionalFolders(additionalFolders = []) {
    this.additionalFolders = this.additionalFolders || additionalFolders;

    if (_.isString(this.additionalFolders)) {
      this.additionalFolders = [this.additionalFolders];
    }
  }

  async getAllData(force = false) {
    if (force || !this.allData) {
      console.time('getAllData');

      // TODO: ignorePaths

      const allContent = [];
      const exts = ['.yaml', '.yml', '.ppd'];
      let paths = [];
      const folders = [this.rootFolder, ...this.additionalFolders].map(v => path.normalize(v));

      for (let i = 0; i < folders.length; i++) {
        const pathsFolder = walkSync(folders[i]).map(v => path.join(folders[i], v));
        paths = [...paths, ...pathsFolder];
      }

      // startsWith('.') remove folders like .git
      const allFiles = _.filter(paths, v => !v.startsWith('.') && exts.includes(path.parse(v).ext));

      allFiles.forEach(filePath => {
        try {
          const full = yaml.safeLoadAll(fs.readFileSync(filePath, 'utf8'));
          for (let v of full) {
            v.filePath = filePath;
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
