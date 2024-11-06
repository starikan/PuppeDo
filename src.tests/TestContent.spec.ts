import fs from 'fs';
import TestsContent from '../src/TestContent';
import { Arguments } from '../src/Arguments';
import { DataType, EnvBrowserType, RunnerType, TestExtendType } from '../src/global.d';

const DEFAULT_BROWSER: EnvBrowserType = {
  type: 'browser',
  engine: 'playwright',
  browserName: 'chromium',
  runtime: 'run',
  headless: true,
  slowMo: 0,
};

describe('TestContent', () => {
  beforeAll(() => {
    // eslint-disable-next-line no-new
    new Arguments(
      {
        PPD_ROOT_IGNORE: ['.git', 'node_modules', '.history', 'output', '.github', '.vscode'],
        PPD_FILES_IGNORE: ['tests\\broken.yaml'],
        PPD_ROOT_ADDITIONAL: ['bar'],
        PPD_ROOT: 'tests',
      },
      {},
      true,
    );
  });

  test('Getting data', () => {
    const { allData } = new TestsContent();
    const { allData: allData2 } = new TestsContent();
    expect(allData).toBeDefined();
    expect(allData).toEqual(allData2);
  });

  test('getAllData', () => {
    const allData = new TestsContent().getAllData();
    expect(allData).toBeDefined();
    expect(allData.allFiles).toBeDefined();
    expect(allData.allContent).toBeDefined();
    expect(allData.atoms).toBeDefined();
    expect(allData.tests).toBeDefined();
    expect(allData.runners).toBeDefined();
    expect(allData.data).toBeDefined();
    expect(allData.selectors).toBeDefined();
  });

  test('getAllData with args', () => {
    // eslint-disable-next-line no-new
    new Arguments(
      {
        PPD_ROOT_ADDITIONAL: [],
        PPD_ROOT: 'notExistFolder',
      },
      {},
      true,
    );

    const allData = new TestsContent(true).getAllData(true);
    expect(allData.allFiles).toEqual([]);
    expect(allData.allContent).toEqual([]);
    expect(allData.atoms).toEqual([]);
    expect(allData.tests).toEqual([]);
    expect(allData.runners).toEqual([]);
    expect(allData.data).toEqual([]);
    expect(allData.selectors).toEqual([]);
  });
});

describe('TestsContent.resolveRunners (AI generated)', () => {
  it('should merge data from extended runners', () => {
    const runners: RunnerType[] = [
      {
        name: 'baseRunner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        log: { level: 'info' },
        data: { key1: 'value1' },
        selectors: { sel1: '#selector1' },
        description: 'Base runner',
      },
      {
        name: 'extendedRunner',
        type: 'runner',
        runnersExt: ['baseRunner'],
        browser: DEFAULT_BROWSER,
        log: { level: 'info' },
        data: { key2: 'value2' },
        selectors: { sel2: '#selector2' },
        description: 'Extended runner',
      },
    ];

    const result = TestsContent.resolveRunners(runners, [], []);
    const extendedRunner = result.find((r) => r.name === 'extendedRunner');

    expect(extendedRunner).toEqual({
      name: 'extendedRunner',
      type: 'runner',
      runnersExt: ['baseRunner'],
      browser: DEFAULT_BROWSER,
      log: { level: 'info' },
      data: { key1: 'value1', key2: 'value2' },
      selectors: { sel1: '#selector1', sel2: '#selector2' },
      description: 'Extended runner -> Base runner',
    });
  });

  it('should extend data from dataExt', () => {
    const runners: RunnerType[] = [
      {
        name: 'runner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        dataExt: ['testData'],
        data: { original: 'value' },
      },
    ];

    const data: DataType[] = [
      {
        name: 'testData',
        type: 'data',
        testFile: 'test.yaml',
        data: { extended: 'value' },
      },
    ];

    const result = TestsContent.resolveRunners(runners, data, []);
    expect(result[0].data).toEqual({
      original: 'value',
      extended: 'value',
    });
  });

  it('should extend selectors from selectorsExt', () => {
    const runners: RunnerType[] = [
      {
        name: 'runner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        selectorsExt: ['testSelectors'],
        selectors: { original: '#selector1' },
      },
    ];

    const selectors: DataType[] = [
      {
        name: 'testSelectors',
        type: 'selectors',
        testFile: 'test.yaml',
        data: { extended: '#selector2' },
      },
    ];

    const result = TestsContent.resolveRunners(runners, [], selectors);
    expect(result[0].selectors).toEqual({
      original: '#selector1',
      extended: '#selector2',
    });
  });

  it('should throw error when extended resources are missing', () => {
    const runnersMissing: RunnerType[] = [
      {
        name: 'runner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        runnersExt: ['nonExistentRunner'],
      },
    ];

    expect(() => {
      TestsContent.resolveRunners(runnersMissing, [], []);
    }).toThrow("PuppeDo can't resolve extended runner 'nonExistentRunner' in runner 'runner'");

    const dataExt: RunnerType[] = [
      {
        name: 'runner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        dataExt: ['nonExistentData'],
      },
    ];

    expect(() => {
      TestsContent.resolveRunners(dataExt, [], []);
    }).toThrow("PuppeDo can't resolve extended data 'nonExistentData' in runner 'runner'");

    const selectorsExt: RunnerType[] = [
      {
        name: 'runner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        selectorsExt: ['nonExistentSelectors'],
      },
    ];

    expect(() => {
      TestsContent.resolveRunners(selectorsExt, [], []);
    }).toThrow("PuppeDo can't resolve extended selectors 'nonExistentSelectors' in runner 'runner'");
  });

  it('should handle empty extensions correctly', () => {
    const runners: RunnerType[] = [
      {
        name: 'runner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        runnersExt: [],
        dataExt: [],
        selectorsExt: [],
      },
    ];

    const result = TestsContent.resolveRunners(runners, [], []);
    expect(result).toEqual(runners);
  });

  it('should correctly merge log, data, selectors and description during inheritance', () => {
    const runners: RunnerType[] = [
      {
        name: 'baseRunner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        log: {
          level: 'info',
          screenshot: true,
        },
        data: {
          key1: 'base1',
          shared: 'base',
        },
        selectors: {
          sel1: '#base1',
          sharedSel: '#base',
        },
        description: 'Base runner',
      },
      {
        name: 'middleRunner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        runnersExt: ['baseRunner'],
        log: {
          fullpage: true,
        },
        data: {
          key2: 'middle2',
          shared: 'base',
        },
        selectors: {
          sel2: '#middle2',
          sharedSel: '#base',
        },
        description: 'Middle runner',
      },
      {
        name: 'finalRunner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        runnersExt: ['middleRunner'],
        log: {
          level: 'info',
        },
        data: {
          key3: 'final3',
          shared: 'base',
        },
        selectors: {
          sel3: '#final3',
          sharedSel: '#base',
        },
        description: 'Final runner',
      },
    ];

    const result = TestsContent.resolveRunners(runners, [], []);
    const finalRunner = result.find((r) => r.name === 'finalRunner');

    expect(finalRunner).toEqual({
      name: 'finalRunner',
      type: 'runner',
      browser: DEFAULT_BROWSER,
      runnersExt: ['middleRunner'],
      log: {
        level: 'info', // from baseRunner
        screenshot: true, // from baseRunner
        fullpage: true, // from middleRunner
      },
      data: {
        key1: 'base1', // from baseRunner
        key2: 'middle2', // from middleRunner
        key3: 'final3', // from finalRunner
        shared: 'base', // from baseRunner, not overwritten
      },
      selectors: {
        sel1: '#base1', // from baseRunner
        sel2: '#middle2', // from middleRunner
        sel3: '#final3', // from finalRunner
        sharedSel: '#base', // from baseRunner, not overwritten
      },
      description: 'Final runner -> Middle runner -> Base runner',
    });
  });

  it('should handle missing optional fields correctly', () => {
    const runners: RunnerType[] = [
      {
        name: 'baseRunner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        description: 'Base runner',
      },
      {
        name: 'extendedRunner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        runnersExt: ['baseRunner'],
        description: 'Extended runner',
      },
    ];

    const result = TestsContent.resolveRunners(runners, [], []);
    const extendedRunner = result.find((r) => r.name === 'extendedRunner');

    // Check that missing fields are initialized with empty objects
    expect(extendedRunner).toEqual({
      name: 'extendedRunner',
      type: 'runner',
      browser: DEFAULT_BROWSER,
      runnersExt: ['baseRunner'],
      log: {},
      data: {},
      selectors: {},
      description: 'Extended runner -> Base runner',
    });
  });

  it('should handle multiple runner extensions correctly', () => {
    const runners: RunnerType[] = [
      {
        name: 'baseRunner1',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        data: { key1: 'value1' },
        description: 'Base runner 1',
      },
      {
        name: 'baseRunner2',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        data: { key2: 'value2' },
        description: 'Base runner 2',
      },
      {
        name: 'extendedRunner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        runnersExt: ['baseRunner2', 'baseRunner1'],
        data: { key3: 'value3' },
        description: 'Extended runner',
      },
    ];

    const result = TestsContent.resolveRunners(runners, [], []);
    const extendedRunner = result.find((r) => r.name === 'extendedRunner');

    expect(extendedRunner?.data).toEqual({
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    });
    expect(extendedRunner?.description).toBe('Extended runner -> Base runner 2 -> Base runner 1');
  });

  it('should handle browser from extended runners correctly', () => {
    const runners: RunnerType[] = [
      {
        name: 'baseRunner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        description: 'Base runner',
      },
      {
        name: 'extendedRunner',
        type: 'runner',
        browser: {
          ...DEFAULT_BROWSER,
          headless: false,
          slowMo: 100,
          args: ['--no-sandbox'],
        },
        runnersExt: ['baseRunner'],
        description: 'Extended runner',
      },
    ];

    const result = TestsContent.resolveRunners(runners, [], []);
    const extendedRunner = result.find((r) => r.name === 'extendedRunner');

    expect(extendedRunner?.browser).toEqual({
      ...DEFAULT_BROWSER,
      args: ['--no-sandbox'],
    });
  });

  it('should handle missing testFile', () => {
    const runners: RunnerType[] = [
      {
        name: 'runner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        description: 'Test runner',
      },
    ];

    const result = TestsContent.resolveRunners(runners, [], []);
    expect(result).toEqual(runners);
  });

  it('should handle empty extension arrays correctly', () => {
    const runners: RunnerType[] = [
      {
        name: 'runner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        dataExt: [],
        selectorsExt: [],
        runnersExt: [],
        description: 'Test runner',
      },
    ];

    const result = TestsContent.resolveRunners(runners, [], []);
    expect(result).toEqual(runners);
  });

  it('should merge runner descriptions correctly and handle missing descriptions', () => {
    const runners: RunnerType[] = [
      {
        name: 'baseRunner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        description: 'Base runner',
      },
      {
        name: 'extendedRunner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        description: 'Extended runner',
        runnersExt: ['baseRunner'],
      },
      {
        name: 'baseRunnerNoDesc',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        // no description
      },
      {
        name: 'extendedRunnerNoDesc',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        runnersExt: ['baseRunnerNoDesc'],
        // no description
      },
      {
        name: 'extendedRunnerWithDesc',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        description: 'Extended runner with desc',
        runnersExt: ['baseRunnerNoDesc'],
      },
    ];

    const result = TestsContent.resolveRunners(runners, [], []);

    expect(result.find((r) => r.name === 'extendedRunner')?.description).toBe('Extended runner -> Base runner');
    expect(result.find((r) => r.name === 'extendedRunnerNoDesc')?.description).toBe(' -> ');
    expect(result.find((r) => r.name === 'extendedRunnerWithDesc')?.description).toBe('Extended runner with desc -> ');
  });

  it('should handle missing data during merge correctly', () => {
    const runners: RunnerType[] = [
      {
        name: 'runner1',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        dataExt: ['data1', 'data2', 'data3', 'data4'],
        // data is missing
      },
      {
        name: 'runner2',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        dataExt: ['data1', 'data2', 'data3', 'data4'],
        data: { runnerData: 'value' },
      },
    ];

    const data: DataType[] = [
      {
        name: 'data1',
        type: 'data',
        testFile: 'test.yaml',
        data: {},
      },
      {
        name: 'data2',
        type: 'data',
        testFile: 'test.yaml',
        data: { extendedData: 'value' },
      },
      {
        name: 'data3',
        type: 'data',
        testFile: 'test.yaml',
        data: null,
      },
      {
        name: 'data4',
        type: 'data',
        testFile: 'test.yaml',
        data: undefined,
      },
    ];

    const result = TestsContent.resolveRunners(runners, data, []);

    // Check case when runner has no data
    expect(result.find((r) => r.name === 'runner1')?.data).toEqual({
      extendedData: 'value',
    });

    // Check case when runner has data
    expect(result.find((r) => r.name === 'runner2')?.data).toEqual({
      runnerData: 'value',
      extendedData: 'value',
    });
  });

  it('should merge browser properties correctly', () => {
    const runners: RunnerType[] = [
      {
        name: 'baseRunner',
        type: 'runner',
        browser: {
          type: 'browser',
          engine: 'playwright',
          browserName: 'chromium',
          headless: true,
          runtime: 'run',
          slowMo: 0,
        },
      },
      {
        name: 'extendedRunner',
        type: 'runner',
        runnersExt: ['baseRunner'],
        browser: {
          headless: false,
          slowMo: 100,
          type: 'browser',
          engine: 'playwright',
          browserName: 'chromium',
          runtime: 'run',
        },
      },
    ];

    const result = TestsContent.resolveRunners(runners, [], []);
    const extendedRunner = result.find((r) => r.name === 'extendedRunner');

    expect(extendedRunner?.browser).toEqual({
      type: 'browser',
      engine: 'playwright',
      browserName: 'chromium',
      runtime: 'run',
      headless: true, // from baseRunner
      slowMo: 0, // from baseRunner
    });
  });
});

describe('TestsContent.checkDuplicates (AI generated)', () => {
  // Base test object
  const createTestObject = (name: string, testFile: string): TestExtendType => ({
    type: 'atom',
    name,
    testFile,
    needData: [],
    needSelectors: [],
    needEnvParams: [],
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
    bindDescription: '',
    repeat: 1,
    while: '',
    if: '',
    errorIf: '',
    errorIfResult: '',
    tags: [],
    engineSupports: [],
    todo: '',
    beforeTest: [],
    runTest: [],
    afterTest: [],
    inlineJS: '',
    breakParentIfResult: '',
  });

  it('should pass array without duplicates', () => {
    const tests = [
      createTestObject('test1', 'file1.yaml'),
      createTestObject('test2', 'file2.yaml'),
      createTestObject('test3', 'file3.yaml'),
    ];

    const result = TestsContent.checkDuplicates(tests);
    expect(result).toEqual(tests);
  });

  it('should throw error on empty names', () => {
    const tests = [
      createTestObject('', 'file1.yaml'),
      createTestObject('test2', 'file2.yaml'),
      createTestObject('', 'file3.yaml'),
    ];

    expect(() => TestsContent.checkDuplicates(tests)).toThrow(
      "There is blank 'name' value in files:\nfile1.yaml\nfile3.yaml",
    );
  });

  it('should pass objects without testFile', () => {
    const tests = [
      { ...createTestObject('test1', ''), testFile: undefined },
      { ...createTestObject('test1', ''), testFile: undefined },
    ];

    const result = TestsContent.checkDuplicates(tests);
    expect(result).toEqual(tests);
  });

  it('should throw error on duplicates', () => {
    const tests = [
      createTestObject('test1', 'file1.yaml'),
      createTestObject('test1', 'file2.yaml'),
      createTestObject('test2', 'file3.yaml'),
      createTestObject('test2', 'file4.yaml'),
    ];

    expect(() => TestsContent.checkDuplicates(tests)).toThrow(
      "There is duplicates of 'atom':\n- Name: 'test1'.\n    * 'file1.yaml'\n    * 'file2.yaml'\n\n- Name: 'test2'.\n    * 'file3.yaml'\n    * 'file4.yaml'\n",
    );
  });

  it('should handle different object types correctly', () => {
    const runnerTests: RunnerType[] = [
      { name: 'runner1', type: 'runner', testFile: 'file1.yaml', browser: {} as any },
      { name: 'runner2', type: 'runner', testFile: 'file2.yaml', browser: {} as any },
    ];

    const dataTests: DataType[] = [
      { name: 'data1', type: 'data', testFile: 'file1.yaml', data: {} },
      { name: 'data2', type: 'data', testFile: 'file2.yaml', data: {} },
    ];

    expect(TestsContent.checkDuplicates(runnerTests)).toEqual(runnerTests);
    expect(TestsContent.checkDuplicates(dataTests)).toEqual(dataTests);
  });

  it('should pass empty array', () => {
    const result = TestsContent.checkDuplicates([]);
    expect(result).toEqual([]);
  });

  it('should handle single element correctly', () => {
    const tests = [createTestObject('test1', 'file1.yaml')];
    const result = TestsContent.checkDuplicates(tests);
    expect(result).toEqual(tests);
  });
});

describe('TestsContent.getAllData (AI generated)', () => {
  let testsContent: TestsContent;

  const DEFAULT_ARGS = {
    PPD_IGNORE_TESTS_WITHOUT_NAME: false,
    PPD_ROOT: 'tests',
    PPD_ROOT_ADDITIONAL: ['bar'],
    PPD_ROOT_IGNORE: ['.git', 'node_modules', '.history', 'output', '.github', '.vscode'],
    PPD_FILES_IGNORE: ['tests\\broken.yaml'],
    PPD_TESTS: ['testName'],
    PPD_OUTPUT: 'output',
    PPD_DATA: {},
    PPD_SELECTORS: {},
    PPD_DEBUG_MODE: false,
    PPD_LOG_DISABLED: false,
    PPD_LOG_EXTEND: false,
    PPD_LOG_LEVEL_NESTED: 0,
    PPD_LOG_LEVEL_TYPE_IGNORE: [],
    PPD_LOG_SCREENSHOT: false,
    PPD_LOG_FULLPAGE: false,
    PPD_LOG_TEST_NAME: false,
    PPD_LOG_IGNORE_HIDE_LOG: false,
    PPD_TAGS_TO_RUN: [],
    PPD_LOG_DOCUMENTATION_MODE: false,
    PPD_LOG_NAMES_ONLY: [],
    PPD_LOG_TIMER_SHOW: false,
    PPD_LOG_TIMESTAMP_SHOW: false,
    PPD_LOG_INDENT_LENGTH: 2,
    PPD_LOG_STEPID: false,
    PPD_CONTINUE_ON_ERROR_ENABLED: false,
  };

  beforeEach(() => {
    testsContent = new TestsContent();
    jest.clearAllMocks();
  });

  test('should initialize allData when reInit is true', () => {
    const allData = testsContent.getAllData(true);
    expect(allData).toBeDefined();
  });

  test('should not reinitialize allData if it already exists', () => {
    testsContent.getAllData(true);
    const allData = testsContent.getAllData();
    expect(allData).toBeDefined();
  });

  test('should not throw error if test has no name and PPD_IGNORE_TESTS_WITHOUT_NAME is true', () => {
    jest.spyOn(Arguments.prototype, 'args', 'get').mockReturnValue({
      ...DEFAULT_ARGS,
      PPD_IGNORE_TESTS_WITHOUT_NAME: true,
    });
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([{ name: '' }]));

    expect(() => testsContent.getAllData()).not.toThrow();
  });

  test('should resolve runners correctly', () => {
    // Mock data for runners
    const runners: RunnerType[] = [
      {
        name: 'runner1',
        dataExt: ['data1'],
        selectorsExt: ['selector1'],
        type: 'runner',
        browser: DEFAULT_BROWSER,
      },
    ];
    const data: Array<DataType> = [{ name: 'data1', type: 'data', testFile: 'test.yaml', data: { key: 'value' } }];
    const selectors: Array<DataType> = [
      { name: 'selector1', type: 'selectors', testFile: 'test.yaml', data: { key: 'value' } },
    ];

    const resolvedRunners = TestsContent.resolveRunners(runners, data, selectors);
    expect(resolvedRunners).toHaveLength(1);
    expect(resolvedRunners[0].data).toEqual({ key: 'value' });
    expect(resolvedRunners[0].selectors).toEqual({ key: 'value' });
  });

  it('should not read file if it does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const result = testsContent.getAllData(); // Вызовите вашу функцию

    expect(result).toEqual({
      allContent: [],
      allFiles: [],
      atoms: [],
      data: [],
      runners: [],
      selectors: [],
      tests: [],
    }); // Ожидаем, что результат будет пустым
  });
});
