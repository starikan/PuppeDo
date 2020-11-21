import path from 'path';
import fs from 'fs';

import yaml from 'js-yaml';

import Singleton from './Singleton';
import { Arguments } from './Arguments';
import { merge, walkSync } from './Helpers';

import {
  TestType,
  EnvType,
  DataType,
  EnvBrowserType,
  BrowserTypeType,
  BrowserEngineType,
  BrowserNameType,
  TestTypeYaml,
} from './global.d';

type AllDataType = {
  allFiles: Array<string>;
  allContent: Array<TestType | EnvType | DataType>;
  atoms: Array<TestType>;
  tests: Array<TestType>;
  envs: Array<EnvType>;
  data: Array<DataType>;
  selectors: Array<DataType>;
};

const BLANK_TEST: TestType = {
  name: '',
  type: 'test',
  needData: [],
  needSelectors: [],
  options: {},
  dataExt: [],
  selectorsExt: [],
  allowResults: [],
  allowOptions: [],
  debug: false,
  debugInfo: false,
  disable: false,
  logOptions: {},
  frame: '',
  data: {},
  bindData: {},
  selectors: {},
  bindSelectors: {},
  bindResults: {},
  description: '',
  descriptionExtend: [],
  descriptionError: '',
  bindDescription: '',
  repeat: 1,
  while: '',
  if: '',
  errorIf: '',
  errorIfResult: '',
  tags: [],
  engineSupports: null,
  testFile: '',
  todo: '',
};

const resolveTest = (test: TestTypeYaml): TestType => ({ ...BLANK_TEST, ...test });

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
            return walkSync(folder, { ignoreFolders: this.ignorePaths, extensions });
          }
          return [];
        })
        .flat();

      paths.forEach((filePath) => {
        try {
          const testsYaml = yaml.safeLoadAll(fs.readFileSync(filePath, 'utf8'));
          testsYaml.forEach((v) => {
            const collect = { ...{ type: 'test' }, ...v, ...{ testFile: filePath } };
            if (collect.type === 'test') {
              allContent.push(resolveTest(collect));
            } else {
              allContent.push(collect);
            }
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

  static resolveBrowser(browserInput: EnvBrowserType = {}): EnvBrowserType {
    const DEFAULT_BROWSER: EnvBrowserType = {
      type: 'browser',
      engine: 'playwright',
      browserName: 'chromium',
      runtime: 'run',
      headless: false,
      slowMo: 1,
    };
    const ALLOW_BROWSER_TYPES: BrowserTypeType[] = ['api', 'browser', 'electron'];
    const ALLOW_BROWSER_EGINES: BrowserEngineType[] = ['puppeteer', 'playwright'];
    const ALLOW_BROWSER_MANES: BrowserNameType[] = ['chrome', 'chromium', 'firefox', 'webkit'];

    const browser = { ...DEFAULT_BROWSER, ...browserInput };

    if (!ALLOW_BROWSER_TYPES.includes(browser.type)) {
      throw new Error(
        `PuppeDo can't find this type of envitonment: "${browser.type}". Allow this types: ${ALLOW_BROWSER_TYPES}`,
      );
    }

    if (browser.type === 'api') {
      throw new Error("PuppeDo can't work with API yet.");
    }

    if (!ALLOW_BROWSER_EGINES.includes(browser.engine) && (browser.type === 'browser' || browser.type === 'electron')) {
      throw new Error(`PuppeDo can't find engine: "${browser.engine}". Allow this engines: ${ALLOW_BROWSER_EGINES}`);
    }

    if (!ALLOW_BROWSER_MANES.includes(browser.browserName)) {
      throw new Error(
        `PuppeDo can't find this type of browser: "${browser.browserName}". Allow this types: ${ALLOW_BROWSER_MANES}`,
      );
    }

    if (
      browser.type === 'browser' &&
      browser.engine === 'playwright' &&
      !['chromium', 'firefox', 'webkit'].includes(browser.browserName)
    ) {
      throw new Error("Playwright supports only browsers: 'chromium', 'firefox', 'webkit'");
    }

    if (
      browser.type === 'browser' &&
      browser.engine === 'puppeteer' &&
      !['chrome', 'firefox'].includes(browser.browserName)
    ) {
      throw new Error("Playwright supports only browsers: 'chrome', 'firefox'");
    }

    if (!['run', 'connect'].includes(browser.runtime)) {
      throw new Error('PuppeDo can run or connect to browser only');
    }

    if (browser.runtime === 'connect' && browser.type === 'browser') {
      throw new Error("PuppeDo can't connect to browser yet");
    }

    return browser;
  }

  static resolveEnvs(envsAll: Array<EnvType>, dataAll: Array<DataType>, selectorsAll: Array<DataType>): Array<EnvType> {
    return envsAll.map((env: EnvType) => {
      const envUpdated = env;
      const { dataExt = [], selectorsExt = [], envsExt = [], data: dataEnv = {}, selectors: selectorsEnv = {} } = env;
      envUpdated.browser = TestsContent.resolveBrowser(envUpdated.browser);

      envsExt.forEach((envsExtName: string) => {
        const envsResolved: EnvType | undefined = envsAll.find((g: EnvType) => g.name === envsExtName);
        if (envsResolved) {
          envUpdated.browser = TestsContent.resolveBrowser(merge(envUpdated.browser, envsResolved.browser || {}));
          envUpdated.log = merge(envUpdated.log || {}, envsResolved.log || {});
          envUpdated.data = merge(envUpdated.data || {}, envsResolved.data || {});
          envUpdated.selectors = merge(envUpdated.selectors || {}, envsResolved.selectors || {});
          envUpdated.description = `${envUpdated.description || ''} -> ${envsResolved.description || ''}`;
        } else {
          throw new Error(`PuppeDo can't resolve extended environment '${envsExtName}' in environment '${env.name}'`);
        }
      });

      dataExt.forEach((dataExtName: string) => {
        const dataResolved: DataType | undefined = dataAll.find((g: DataType) => g.name === dataExtName);
        if (dataResolved) {
          envUpdated.data = merge(envUpdated.data || {}, dataResolved.data || {}, dataEnv);
        } else {
          throw new Error(`PuppeDo can't resolve extended data '${dataExtName}' in environment '${env.name}'`);
        }
      });

      selectorsExt.forEach((selectorsExtName: string) => {
        const selectorsResolved: DataType | undefined = selectorsAll.find((g: DataType) => g.name === selectorsExtName);
        if (selectorsResolved) {
          envUpdated.selectors = merge(envUpdated.selectors || {}, selectorsResolved.data || {}, selectorsEnv);
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
