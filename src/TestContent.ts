import path from 'path';
import fs from 'fs';

import yaml from 'js-yaml';

import Singleton from './Singleton';
import { Arguments } from './Arguments';
import { merge, walkSync } from './Helpers';

import { TestType, RunnerType, DataType, TestTypeYaml, TestExtendType, AllDataType } from './global.d';

export const BLANK_TEST: TestType = {
  afterTest: [],
  allowOptions: [],
  allowResults: [],
  beforeTest: [],
  bindData: {},
  bindDescription: '',
  bindResults: {},
  bindSelectors: {},
  data: {},
  dataExt: [],
  debug: false,
  debugInfo: false,
  description: '',
  descriptionExtend: [],
  disable: false,
  engineSupports: [],
  errorIf: '',
  errorIfResult: '',
  frame: '',
  if: '',
  inlineJS: '',
  logOptions: {},
  name: '',
  needData: [],
  needSelectors: [],
  needEnvParams: [],
  options: {},
  repeat: 1,
  runTest: [],
  selectors: {},
  selectorsExt: [],
  tags: [],
  todo: '',
  type: 'test',
  while: '',
};

const resolveTest = (test: TestTypeYaml): TestType => ({ ...BLANK_TEST, ...test });

export default class TestsContent extends Singleton {
  allData!: AllDataType;

  constructor(reInit = false) {
    super();

    if (reInit || !this.allData) {
      this.allData = this.getAllData();
    }
  }

  static getPaths(): string[] {
    const { PPD_ROOT, PPD_ROOT_ADDITIONAL, PPD_ROOT_IGNORE, PPD_FILES_IGNORE } = new Arguments().args;

    const rootFolder = path.normalize(PPD_ROOT);
    const additionalFolders = PPD_ROOT_ADDITIONAL.map((v: string) => path.normalize(v));
    const ignoreFolders = PPD_ROOT_IGNORE.map((v: string) => path.normalize(v));
    const ignoreFiles = PPD_FILES_IGNORE.map((v: string) => path.join(rootFolder, path.normalize(v)));

    // TODO: 2022-11-07 S.Starodubov move to Arguments
    const PPD_FILES_EXTENSIONS_AVAILABLE = ['.yaml', '.yml', '.ppd', '.json'];
    const folders = [rootFolder, ...additionalFolders].map((v) => path.normalize(v));

    const paths = folders
      .map((folder) => {
        if (fs.existsSync(folder)) {
          return walkSync(folder, { ignoreFolders, ignoreFiles, extensions: PPD_FILES_EXTENSIONS_AVAILABLE });
        }
        return [];
      })
      .flat();

    return paths;
  }

  static checkDuplicates<T extends TestExtendType | RunnerType | DataType>(tests: Array<T>): Array<T> {
    const blankNames = tests.filter((v) => !v.name);
    if (blankNames.length) {
      throw new Error(`There is blank 'name' value in files:\n${blankNames.map((v) => v.testFile).join('\n')}`);
    }

    const dubs = tests.reduce((s: Record<string, string[]>, v: T) => {
      const collector = { ...s };
      if (!v.testFile) {
        return collector;
      }
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
    const { PPD_IGNORE_TESTS_WITHOUT_NAME } = new Arguments().args;

    if (force || !this.allData) {
      const allContent: Array<TestType | RunnerType | DataType> = [];

      const paths = TestsContent.getPaths();
      paths.forEach((filePath) => {
        let testData: Partial<TestTypeYaml>[] = [];
        if (filePath.endsWith('.json')) {
          try {
            testData = __non_webpack_require__(filePath);
            if (!Array.isArray(testData)) {
              testData = [testData];
            }
          } catch (e) {
            console.log(
              `\u001B[41mError JSON read. File: '${filePath}'. Try to check it on https://jsonlint.com/
              or add this file into PPD_FILES_IGNORE of folder into PPD_ROOT_IGNORE`,
            );
          }
        } else {
          try {
            testData = yaml.loadAll(fs.readFileSync(filePath, 'utf8')) as Partial<TestTypeYaml>[];
          } catch (e) {
            console.log(
              `\u001B[41mError YAML read. File: '${filePath}'. Try to check it on https://yamlchecker.com/
              or add this file into PPD_FILES_IGNORE of folder into PPD_ROOT_IGNORE`,
            );
          }
        }

        testData.forEach((v) => {
          const { name } = v;
          if (!name && !PPD_IGNORE_TESTS_WITHOUT_NAME) {
            throw new Error('Every test need name');
          }
          if (!name) {
            return;
          }
          const collect = {
            ...{ type: 'test', name },
            ...v,
            ...{ testFile: filePath },
          };
          if (collect.type === 'test') {
            allContent.push(resolveTest(collect as TestTypeYaml));
          } else {
            allContent.push(collect as RunnerType | DataType);
          }
        });
      });

      const atoms: Array<TestType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is TestExtendType => v.type === 'atom'),
      );
      const tests: Array<TestType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is TestExtendType => v.type === 'test'),
      );
      const data: Array<DataType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is DataType => v.type === 'data'),
      );
      const selectors: Array<DataType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is DataType => v.type === 'selectors'),
      );
      const runners: Array<RunnerType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is RunnerType => v.type === 'runner'),
      );
      const runnersResolved = TestsContent.resolveRunners(runners, data, selectors);

      this.allData = { allFiles: paths, allContent, atoms, tests, runners: runnersResolved, data, selectors };
    }

    return this.allData;
  }

  static resolveRunners(
    runnersAll: Array<RunnerType>,
    dataAll: Array<DataType>,
    selectorsAll: Array<DataType>,
  ): Array<RunnerType> {
    return runnersAll.map((runner: RunnerType) => {
      const runnerUpdated = runner;
      const {
        dataExt = [],
        selectorsExt = [],
        runnersExt = [],
        data: dataEnv = {},
        selectors: selectorsEnv = {},
      } = runner;

      runnersExt.forEach((runnersExtName: string) => {
        const runnersResolved: RunnerType | undefined = runnersAll.find((g: RunnerType) => g.name === runnersExtName);
        if (runnersResolved) {
          if (runnersResolved.browser) {
            runnerUpdated.browser = merge(runnerUpdated.browser, runnersResolved.browser);
          }
          runnerUpdated.log = { ...(runnerUpdated.log || {}), ...(runnersResolved.log || {}) };
          runnerUpdated.data = { ...(runnerUpdated.data || {}), ...(runnersResolved.data || {}) };
          runnerUpdated.selectors = { ...(runnerUpdated.selectors || {}), ...(runnersResolved.selectors || {}) };
          runnerUpdated.description = `${runnerUpdated.description || ''} -> ${runnersResolved.description || ''}`;
        } else {
          throw new Error(`PuppeDo can't resolve extended runner '${runnersExtName}' in runner '${runner.name}'`);
        }
      });

      dataExt.forEach((dataExtName: string) => {
        const dataResolved: DataType | undefined = dataAll.find((g: DataType) => g.name === dataExtName);
        if (dataResolved) {
          runnerUpdated.data = { ...(runnerUpdated.data || {}), ...(dataResolved.data || {}), ...dataEnv };
        } else {
          throw new Error(`PuppeDo can't resolve extended data '${dataExtName}' in runner '${runner.name}'`);
        }
      });

      selectorsExt.forEach((selectorsExtName: string) => {
        const selectorsResolved: DataType | undefined = selectorsAll.find((g: DataType) => g.name === selectorsExtName);
        if (selectorsResolved) {
          runnerUpdated.selectors = {
            ...(runnerUpdated.selectors || {}),
            ...(selectorsResolved.data || {}),
            ...selectorsEnv,
          };
        } else {
          throw new Error(`PuppeDo can't resolve extended selectors '${selectorsExtName}' in runner '${runner.name}'`);
        }
      });

      return runnerUpdated;
    });
  }
}
