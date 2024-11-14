/* eslint-disable consistent-return */
import path from 'path';
import fs from 'fs';

import yaml from 'js-yaml';
import { walkSync } from '@puppedo/walk-sync';

import Singleton from './Singleton';
import { Arguments } from './Arguments';
import { mergeObjects } from './Helpers';

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
  // TODO: Сделать геттер а это поле приватным
  public allData!: AllDataType;

  constructor(reInit = false) {
    super();

    if (reInit || !this.allData) {
      this.allData = this.getAllData();
    }
  }

  static getPaths(): string[] {
    const { PPD_ROOT, PPD_ROOT_ADDITIONAL, PPD_ROOT_IGNORE, PPD_FILES_IGNORE, PPD_FILES_EXTENSIONS_AVAILABLE } =
      new Arguments().args;

    const rootFolder = path.normalize(PPD_ROOT);
    const additionalFolders = PPD_ROOT_ADDITIONAL.map((v: string) => path.normalize(v));
    const ignoreFolders = PPD_ROOT_IGNORE.map((v: string) => path.normalize(v));
    const ignoreFiles = PPD_FILES_IGNORE.map((v: string) => path.join(rootFolder, path.normalize(v)));

    const folders = [rootFolder, ...additionalFolders].map((v) => path.normalize(v));

    const paths = folders
      .map((folder) => {
        if (fs.existsSync(folder)) {
          return walkSync(folder, { ignoreFolders, ignoreFiles, includeExtensions: PPD_FILES_EXTENSIONS_AVAILABLE });
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

    if (Object.values(dubs).some((v) => v.length > 1)) {
      const key = tests[0].type;
      const files = Object.entries(dubs)
        .filter(([, valueDub]) => valueDub.length > 1)
        .map(([keyDub, valueDub]) => `- Name: '${keyDub}'.\n${valueDub.map((v) => `    * '${v}'\n`).join('')}`)
        .join('\n');
      const message = `There is duplicates of '${key}':\n${files}`;
      throw new Error(message);
    }

    return tests;
  }

  /**
   * Reads the file and returns its content as an array of partially typed tests.
   *
   * @param filePath - The path to the file.
   * @returns An array of partially typed tests.
   */
  static readFile = (filePath: string): Partial<TestTypeYaml>[] => {
    let testData: Partial<TestTypeYaml>[] = [];

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (filePath.endsWith('.json')) {
        testData = JSON.parse(fileContent);
      } else {
        testData = yaml.loadAll(fileContent) as Partial<TestTypeYaml>[];
      }
    } catch {
      const errorType = filePath.endsWith('.json') ? 'JSON' : 'YAML';
      const errorLink = filePath.endsWith('.json') ? 'https://jsonlint.com/' : 'https://yamlchecker.com/';
      console.log(
        `\u001B[41mError ${errorType} read. File: '${filePath}'. Try to check it on ${errorLink}
          or add this file into PPD_FILES_IGNORE of folder into PPD_ROOT_IGNORE`,
      );
    }

    if (!Array.isArray(testData)) {
      return [testData];
    }

    return testData;
  };

  /**
   * Resolving the test file, checking for the presence of a name and test type.
   *
   * @param testContent - Partial YAML test type.
   * @param filePath - Path to the test file.
   * @returns Returns the full YAML test type, Runner type, or Data type.
   */
  static fileResolver = (
    testContent: Partial<TestTypeYaml>,
    filePath: string,
  ): Required<TestTypeYaml> | RunnerType | DataType => {
    const { PPD_IGNORE_TESTS_WITHOUT_NAME } = new Arguments().args;

    const { name } = testContent;

    if (!name && !PPD_IGNORE_TESTS_WITHOUT_NAME) {
      throw new Error('Every test need name');
    }

    if (!name) {
      return;
    }

    const collect = {
      ...{ type: 'test', name },
      ...testContent,
      ...{ testFile: filePath },
    };

    if (['test'].includes(collect.type)) {
      return resolveTest(collect as TestTypeYaml);
    }

    return collect as RunnerType | DataType;
  };

  /**
   * Retrieves all data, including files, content, atoms, tests, runners, data, and selectors.
   * If force is true, the data will be retrieved anew; otherwise, it will be returned from the cache.
   *
   * @param force - A flag indicating whether to retrieve the data anew.
   * @returns An object containing all retrieved data.
   */
  getAllData(force = false): AllDataType {
    if (force || !this.allData) {
      const allFiles = TestsContent.getPaths();

      const allContent: Array<TestType | RunnerType | DataType> = allFiles
        .map((filePath) => TestsContent.readFile(filePath).map((v) => TestsContent.fileResolver(v, filePath)))
        .flat();

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

      this.allData = { allFiles, allContent, atoms, tests, runners: runnersResolved, data, selectors };
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
            runnerResult.browser = mergeObjects(runnerResult.browser, runnerExt?.browser);
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
