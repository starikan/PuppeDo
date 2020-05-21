import path from 'path';
import fs from 'fs';

import walkSync from 'walk-sync';
import yaml from 'js-yaml';

import Singleton from './Singleton';
import Arguments from './Arguments';

type AllDataType = {
  allFiles: Array<string>;
  allContent: Array<TestYamlType | EnvYamlType | DataYamlType>;
  atoms: Array<TestYamlType>;
  tests: Array<TestYamlType>;
  envs: Array<EnvYamlType>;
  data: Array<DataYamlType>;
  selectors: Array<DataYamlType>;
  __instance: any;
};

export default class TestsContent extends Singleton {
  allData!: AllDataType;
  rootFolder!: string;
  additionalFolders!: Array<string>;
  ignorePaths!: Array<string>;

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

  static checkDuplicates(tests, key: string) {
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
    return tests;
  }

  getAllData(force: boolean = false): AllDataType {
    if (force || !this.allData) {
      const allContent: Array<TestYamlType | EnvYamlType | DataYamlType> = [];
      const extensions = ['.yaml', '.yml', '.ppd'];
      const folders = [this.rootFolder, ...this.additionalFolders].map((v) => path.normalize(v));

      const paths = folders
        .map((folder) => {
          if (fs.existsSync(folder)) {
            return walkSync(folder, { ignore: this.ignorePaths, directories: false })
              .filter((v) => extensions.includes(path.parse(v).ext))
              .map((v) => path.join(folder, v));
          }
          return [];
        })
        .flat();

      paths.forEach((filePath) => {
        try {
          const testsYaml = yaml.safeLoadAll(fs.readFileSync(filePath, 'utf8'));
          testsYaml.forEach((v) => {
            const collect = { ...{ type: 'test' }, ...v, ...{ testFile: filePath } };
            allContent.push(collect);
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(`\u001B[41mError YAML read. File: '${filePath}'. Try to check it on https://yamlchecker.com/`);
        }
      });

      const atoms: Array<TestYamlType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is TestYamlType => v.type === 'atom'),
        'atom',
      );
      const tests: Array<TestYamlType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is TestYamlType => v.type === 'test'),
        'test',
      );
      const envs: Array<EnvYamlType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is EnvYamlType => v.type === 'env'),
        'env',
      );
      const data: Array<DataYamlType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is DataYamlType => v.type === 'data'),
        'data',
      );
      const selectors: Array<DataYamlType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is DataYamlType => v.type === 'selectors'),
        'selectors',
      );

      this.allData = { allFiles: paths, allContent, atoms, tests, envs, data, selectors, __instance: this };
    }

    return this.allData;
  }
}
