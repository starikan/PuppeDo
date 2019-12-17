const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const walkSync = require('walk-sync');
const yaml = require('js-yaml');

const { Singleton } = require('./singleton');

class TestsContent extends Singleton {
  constructor({ rootFolder = process.cwd(), additionalFolders = [], ignorePaths = [] } = {}) {
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

  checkDublikates() {
    const { allFiles, allContent, atoms, tests, envs, data, selectors } = this.allData;
    const dubTests = _(tests)
      .groupBy('name')
      .filter(v => v.length > 1)
      .value();
    // TODO: не забыть удалить файлик с дубликатами
    debugger;
  }

  async getAllData(force = false) {
    if (force || !this.allData) {
      console.time('getAllData');

      const allContent = [];
      const exts = ['.yaml', '.yml', '.ppd'];
      const folders = [this.rootFolder, ...this.additionalFolders].map(v => path.normalize(v));

      let paths = [];
      for (let i = 0; i < folders.length; i++) {
        const pathsFolder = walkSync(folders[i])
          .filter(v => !this.ignorePaths.filter(g => v.startsWith(g)).length)
          .map(v => path.join(folders[i], v));
        paths = [...paths, ...pathsFolder];
      }

      // TODO Отрефакторить
      const allFiles = _.filter(paths, v => exts.includes(path.parse(v).ext));

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

      console.timeEnd('getAllData');

      this.allData = { allFiles, allContent, atoms, tests, envs, data, selectors };

      this.checkDublikates();

      return this.allData;
    } else {
      return this.allData;
    }
  }
}

module.exports = {
  TestsContent,
};
