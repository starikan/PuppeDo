import path from 'path';
import fs from 'fs';

import walkSync from 'walk-sync';
import yaml from 'js-yaml';

import Singleton from './Singleton';
import { Arguments } from './Arguments';
import { merge } from './Helpers';

import { TestType, EnvType, DataType } from './global.d';

type AllDataType = {
  allFiles: Array<string>;
  allContent: Array<TestType | EnvType | DataType>;
  atoms: Array<TestType>;
  tests: Array<TestType>;
  envs: Array<EnvType>;
  data: Array<DataType>;
  selectors: Array<DataType>;
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

  static checkDuplicates<T extends TestType | EnvType | DataType>(tests: Array<T>): Array<T> {
    const blankNames = tests.filter((v) => !v.name);
    if (blankNames.length) {
      throw new Error(`There is blank 'name' value in files:\n${blankNames.map((v) => v.testFile).join('\n')}`);
    }

    const dubs = tests.reduce((s: { [key: string]: Array<string> }, v: T) => {
      const collector = { ...s };
      collector[v.name] = !s[v.name] ? [v.testFile] : [...s[v.name], v.testFile];
      return collector;
    }, {});

    const isThrow = Object.values(dubs).some((v) => v.length > 1);

    if (Object.keys(dubs).length && isThrow) {
      const key = tests[0].type;
      let message = `There is duplicates of '${key}':\n`;
      Object.entries(dubs).forEach((dub) => {
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

  getAllData(force = false): AllDataType {
    if (force || !this.allData) {
      const allContent: Array<TestType | EnvType | DataType> = [];
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

      const atoms: Array<TestType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is TestType => v.type === 'atom'),
      );
      const tests: Array<TestType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is TestType => v.type === 'test'),
      );
      const data: Array<DataType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is DataType => v.type === 'data'),
      );
      const selectors: Array<DataType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is DataType => v.type === 'selectors'),
      );

      const envs: Array<EnvType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is EnvType => v.type === 'env'),
      );
      const envsResolved = TestsContent.resolveEnvs(envs, data, selectors);

      this.allData = { allFiles: paths, allContent, atoms, tests, envs: envsResolved, data, selectors };
    }

    return this.allData;
  }

  static resolveEnvs(envsAll: Array<EnvType>, dataAll: Array<DataType>, selectorsAll: Array<DataType>): Array<EnvType> {
    return envsAll.map((env: EnvType) => {
      const envUpdated = env;
      const { dataExt = [], selectorsExt = [], envsExt = [], data: dataEnv = {}, selectors: selectorsEnv = {} } = env;

      envsExt.forEach((envsExtName: string) => {
        const envsResolved: EnvType | undefined = envsAll.find((g: EnvType) => g.name === envsExtName);
        if (envsResolved) {
          envUpdated.browser = merge(env.browser || {}, envsResolved.browser || {});
          envUpdated.log = merge(env.log || {}, envsResolved.log || {});
          envUpdated.data = merge(env.data || {}, envsResolved.data || {});
          envUpdated.selectors = merge(env.selectors || {}, envsResolved.selectors || {});
          envUpdated.description = `${env.description || ''} -> ${envsResolved.description || ''}`;
        } else {
          throw new Error(`PuppeDo can't resolve extended environment '${envsExtName}' in environment '${env.name}'`);
        }
      });

      dataExt.forEach((dataExtName: string) => {
        const dataResolved: DataType | undefined = dataAll.find((g: DataType) => g.name === dataExtName);
        if (dataResolved) {
          envUpdated.data = merge(env.data || {}, dataResolved.data || {}, dataEnv);
        } else {
          throw new Error(`PuppeDo can't resolve extended data '${dataExtName}' in environment '${env.name}'`);
        }
      });

      selectorsExt.forEach((selectorsExtName: string) => {
        const selectorsResolved: DataType | undefined = selectorsAll.find((g: DataType) => g.name === selectorsExtName);
        if (selectorsResolved) {
          envUpdated.selectors = merge(env.selectors || {}, selectorsResolved.data || {}, selectorsEnv);
        } else {
          throw new Error(
            `PuppeDo can't resolve extended selectors '${selectorsExtName}' in environment '${env.name}'`,
          );
        }
      });

      return envUpdated;
    });
  }
}
