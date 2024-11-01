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
  breakParentIfResult: '',
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

  /**
   * Checks array of tests for duplicates and empty names
   *
   * @param tests Array of tests to check
   * @returns Original array of tests if no duplicates found
   * @throws {Error} If empty names or duplicates are found
   */
  static checkDuplicates<T extends TestExtendType | RunnerType | DataType>(tests: Array<T>): Array<T> {
    const blankNames = tests.filter((v) => !v.name);
    if (blankNames.length) {
      throw new Error(`There is blank 'name' value in files:\n${blankNames.map((v) => v.testFile).join('\n')}`);
    }

    const dubs: Record<string, string[]> = {};
    tests.forEach((test) => {
      if (test.testFile) {
        (dubs[test.name] = dubs[test.name] || []).push(test.testFile);
      }
    });

    const isThrow = Object.values(dubs).some((v) => v.length > 1);

    if (isThrow) {
      const key = tests[0].type;
      let message = `There is duplicates of '${key}':\n`;
      Object.entries(dubs).forEach(([keyDub, valueDub]) => {
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
          } catch {
            console.log(
              `\u001B[41mError JSON read. File: '${filePath}'. Try to check it on https://jsonlint.com/
              or add this file into PPD_FILES_IGNORE of folder into PPD_ROOT_IGNORE`,
            );
          }
        } else {
          try {
            testData = yaml.loadAll(fs.readFileSync(filePath, 'utf8')) as Partial<TestTypeYaml>[];
          } catch {
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
          if (['test'].includes(collect.type)) {
            allContent.push(resolveTest(collect as TestTypeYaml));
          } else {
            allContent.push(collect as RunnerType | DataType);
          }
        });
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
      const runners: Array<RunnerType> = TestsContent.checkDuplicates(
        allContent.filter((v): v is RunnerType => v.type === 'runner'),
      );
      const runnersResolved = TestsContent.resolveRunners(runners, data, selectors);

      this.allData = { allFiles: paths, allContent, atoms, tests, runners: runnersResolved, data, selectors };
    }

    return this.allData;
  }

  /**
   * Resolves and merges extensions for runners.
   *
   * @param runnersAll - Array of all runners
   * @param dataAll - Array of all data
   * @param selectorsAll - Array of all selectors
   * @returns Array of resolved runners with merged extensions
   *
   * Function handles three types of extensions:
   * 1. runnersExt - Extension from other runners (inherits browser, log, data, selectors, description)
   * 2. dataExt - Extension of data from external files
   * 3. selectorsExt - Extension of selectors from external files
   *
   * When resolving extensions:
   * - Checks existence of extended resources
   * - Merges properties considering priorities
   * - Updates description to reflect inheritance chain
   * - Throws error if extended resource is not found
   */
  static resolveRunners(
    runnersAll: Array<RunnerType>,
    dataAll: Array<DataType>,
    selectorsAll: Array<DataType>,
  ): Array<RunnerType> {
    return runnersAll.map((runner: RunnerType) => {
      const runnerResult = runner;
      const {
        dataExt = [],
        selectorsExt = [],
        runnersExt = [],
        data: dataRunner = {},
        selectors: selectorsRunner = {},
      } = runner;

      runnersExt.forEach((runnerExtName: string) => {
        const runnerExt = runnersAll.find((r) => r.name === runnerExtName);
        if (runnerExt) {
          if (runnerExt.browser) {
            runnerResult.browser = merge(runnerResult.browser, runnerExt?.browser);
          }
          ['log', 'data', 'selectors'].forEach((key) => {
            runnerResult[key] = { ...(runnerResult[key] ?? {}), ...(runnerExt[key] ?? {}) };
          });
          runnerResult.description = `${runnerResult.description ?? ''} -> ${runnerExt.description ?? ''}`;
        } else {
          throw new Error(`PuppeDo can't resolve extended runner '${runnerExtName}' in runner '${runnerResult.name}'`);
        }
      });

      const resolveExtensions = (
        extNames: string[],
        collection: DataType[],
        type: 'data' | 'selectors',
        runnerValues: Record<string, unknown>,
      ): void => {
        extNames.forEach((extName) => {
          const collectionExt = collection.find((item) => item.name === extName);
          if (!collectionExt) {
            throw new Error(`PuppeDo can't resolve extended ${type} '${extName}' in runner '${runner.name}'`);
          }

          Object.assign(runnerResult, {
            [type]: { ...(runnerResult[type] ?? {}), ...(collectionExt.data ?? {}), ...runnerValues },
          });
        });
      };

      resolveExtensions(dataExt, dataAll, 'data', dataRunner);
      resolveExtensions(selectorsExt, selectorsAll, 'selectors', selectorsRunner);

      return runnerResult;
    });
  }
}
