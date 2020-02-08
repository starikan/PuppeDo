const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const walkSync = require('walk-sync');
const yaml = require('js-yaml');

const Singleton = require('./Singleton');
const { Arguments } = require('./Arguments');

class TestsContent extends Singleton {
  constructor({ rootFolder, additionalFolders, ignorePaths } = {}, reInit = false) {
    super();
    const args = new Arguments();

    if (reInit || !this.allData) {
      this.ignorePaths = ignorePaths || args.PPD_ROOT_IGNORE;
      this.rootFolder = rootFolder || args.PPD_ROOT;
      this.additionalFolders = additionalFolders || args.PPD_ROOT_ADDITIONAL;
      this.rootFolder = path.normalize(this.rootFolder);
      if (_.isString(this.additionalFolders)) {
        this.additionalFolders = [this.additionalFolders];
      }
      this.allData = this.getAllData();
    }
    return this.allData;
  }

  checkDuplicates(tests, key) {
    const blankNames = tests.filter(v => !v.name).map(v => v.testFile);
    if (blankNames.length) {
      throw { message: `There is no name of '${key}' in files:\n${blankNames.join('\n')}` };
    }

    const dubTests = _(tests)
      .groupBy('name')
      .filter(v => v.length > 1)
      .flatten()
      .value();
    const dubNames = dubTests.reduce((s, v) => {
      if (!s.includes(v.name)) {
        s = [...s, v.name];
      }
      return s;
    }, []);
    const dubFiles = dubTests.reduce((s, v) => {
      if (!s.includes(v.testFile)) {
        s = [...s, v.testFile];
      }
      return s;
    }, []);

    if (dubNames.length || dubFiles.length) {
      throw {
        message: `
There is duplicates of '${key}' in files:
${dubFiles.join('\n')}

Names is:
${dubNames.join('\n')}`,
      };
    }
  }

  getAllData(force = false) {
    if (force || !this.allData) {
      const allContent = [];
      const extensions = ['.yaml', '.yml', '.ppd'];
      const folders = [this.rootFolder, ...this.additionalFolders].map(v => path.normalize(v));

      let paths = [];
      for (let i = 0; i < folders.length; i++) {
        if (!fs.existsSync(folders[i])) {
          continue;
        }
        const pathsFolder = walkSync(folders[i])
          .filter(v => !this.ignorePaths.filter(g => v.startsWith(g)).length)
          .map(v => path.join(folders[i], v));
        paths = [...paths, ...pathsFolder];
      }

      const allFiles = _.filter(paths, v => extensions.includes(path.parse(v).ext));

      allFiles.forEach(filePath => {
        try {
          const full = yaml.safeLoadAll(fs.readFileSync(filePath, 'utf8'));
          for (let v of full) {
            v.testFile = filePath;
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

      this.allData = { allFiles, allContent, atoms, tests, envs, data, selectors, __instance: this };

      for (const key of ['atoms', 'tests', 'envs', 'data', 'selectors']) {
        this.checkDuplicates(this.allData[key], key);
      }

      return this.allData;
    } else {
      return this.allData;
    }
  }
}

module.exports = TestsContent;
