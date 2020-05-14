import path from 'path';
import fs from 'fs';

import walkSync from 'walk-sync';
import yaml from 'js-yaml';

import Singleton from './Singleton';
import Arguments from './Arguments';

export default class TestsContent extends Singleton {
  allData: any;
  rootFolder: any;
  additionalFolders: any;
  ignorePaths: any;

  constructor(reInit = false) {
    super();
    const args = { ...new Arguments().args };

    if (reInit || !this.allData) {
      this.rootFolder = path.normalize(args.PPD_ROOT);
      this.additionalFolders = args.PPD_ROOT_ADDITIONAL.map((v: string) => path.normalize(v));
      this.ignorePaths = args.PPD_ROOT_IGNORE.map((v: string) => path.normalize(v));
      this.allData = this.getAllData();
    }
  }

  static checkDuplicates(tests, key) {
    const blankNames = tests.filter((v) => !v.name).map((v) => v.testFile);
    if (blankNames.length) {
      throw new Error(`There is no name of '${key}' in files:\n${blankNames.join('\n')}`);
    }

    const dubs = tests.reduce((s, v) => {
      const collector = { ...s };
      collector[v.name] = !s[v.name] ? [v.testFile] : [...s[v.name], v.testFile];
      return collector;
    }, {});

    const isThrow = Object.values(dubs).some((v: any[]) => v.length > 1);

    if (Object.keys(dubs).length && isThrow) {
      let message = `There is duplicates of '${key}':\n`;
      Object.entries(dubs).forEach((dub: [string, []]) => {
        const [keyDub, valueDub] = dub;
        if (valueDub.length > 1) {
          message += ` - Name: '${keyDub}'.\n`;
          message += valueDub.map((v) => `    * '${v}'\n`).join('');
        }
      });
      throw new Error(message);
    }
    return true;
  }

  getAllData(force: boolean = false) {
    if (force || !this.allData) {
      const allContent: Array<TestYamlType | EnvYamlType | DataYamlType> = [];
      const extensions = ['.yaml', '.yml', '.ppd', '.json'];
      const folders = [this.rootFolder, ...this.additionalFolders].map((v) => path.normalize(v));

      let paths: string[] = [];
      for (let i = 0; i < folders.length; i += 1) {
        if (fs.existsSync(folders[i])) {
          const pathsFolder = walkSync(folders[i], { ignore: this.ignorePaths, directories: false })
            .filter((v) => extensions.includes(path.parse(v).ext))
            .map((v) => path.join(folders[i], v));
          paths = [...paths, ...pathsFolder];
        }
      }

      paths.forEach((filePath) => {
        try {
          const testsYaml = yaml.safeLoadAll(fs.readFileSync(filePath, 'utf8'));
          testsYaml.forEach((v) => {
            const collect = { ...v, ...{ testFile: filePath } };
            collect.type = collect.type || 'test';
            allContent.push(collect);
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(`\u001B[41mError YAML read. File: '${filePath}'. Try to check it on https://yamlchecker.com/`);
        }
      });

      const atoms = allContent.filter((v) => v.type === 'atom' && v);
      const tests = allContent.filter((v) => v.type === 'test' && v);
      const envs = allContent.filter((v) => v.type === 'env' && v);
      const data = allContent.filter((v) => v.type === 'data' && v);
      const selectors = allContent.filter((v) => v.type === 'selectors' && v);

      this.allData = { allFiles: paths, allContent, atoms, tests, envs, data, selectors, __instance: this };

      ['atoms', 'tests', 'envs', 'data', 'selectors'].forEach((key) => {
        TestsContent.checkDuplicates(this.allData[key], key);
      });

      return this.allData;
    }
    return this.allData;
  }
}
