// import path from 'path';

import TestsContent from '../src/TestContent';
import { Arguments } from '../src/Arguments';

import { DataType, EnvBrowserType, RunnerType, TestExtendType } from '../src/global.d';

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

  test('checkDuplicates', () => {
    const CD = TestsContent.checkDuplicates;

    const data: Array<TestExtendType> = [
      {
        type: 'atom',
        name: 'bar',
        testFile: 'lee',
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
      },
      {
        type: 'atom',
        name: 'goo',
        testFile: 'bar',
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
      },
      {
        type: 'atom',
        name: 'zoo',
        testFile: 'tyy',
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
      },
      {
        type: 'atom',
        name: 'daa',
        testFile: 'tee',
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
      },
    ];

    expect(CD(data)).toEqual(data);

    const DEFAULT_BROWSER: EnvBrowserType = {
      type: 'browser',
      engine: 'playwright',
      browserName: 'chromium',
      runtime: 'run',
      headless: false,
      slowMo: 1,
    };
    expect(() => CD([{ name: '', testFile: 'bar', type: 'runner', browser: DEFAULT_BROWSER }])).toThrow(
      new Error("There is blank 'name' value in files:\nbar"),
    );

    const testsObjects1: Array<DataType> = [
      { name: '', testFile: 'bar', type: 'data', data: {} },
      { name: '', testFile: 'tyy', type: 'data', data: {} },
    ];
    expect(() => CD(testsObjects1)).toThrow(new Error("There is blank 'name' value in files:\nbar\ntyy"));

    const testsObjects2: Array<DataType> = [
      { name: 'puu', testFile: 'lee', type: 'selectors', data: {} },
      { name: 'dee', testFile: 'bar', type: 'selectors', data: {} },
      { name: 'dee', testFile: 'tyy', type: 'selectors', data: {} },
    ];
    // TODO: ПОчему этот тест проходит хотя message вобще то нет
    expect(() => CD(testsObjects2)).toThrow(
      new Error(
        `There is duplicates of 'selectors':
 - Name: 'dee'.
    * 'bar'
    * 'tyy'
`,
      ),
    );
  });
});

describe('TestsContent.resolveRunners', () => {
  const DEFAULT_BROWSER: EnvBrowserType = {
    type: 'browser',
    engine: 'playwright',
    browserName: 'chromium',
    runtime: 'run',
    headless: true,
    slowMo: 0,
  };

  it('должен объединять данные из расширенных раннеров', () => {
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

  it('должен расширять данные из dataExt', () => {
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

  it('должен расширять селекторы из selectorsExt', () => {
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

  it('должен выбрасывать ошибку при отсутствии расширяемого раннера', () => {
    const runners: RunnerType[] = [
      {
        name: 'runner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        runnersExt: ['nonExistentRunner'],
      },
    ];

    expect(() => {
      TestsContent.resolveRunners(runners, [], []);
    }).toThrow("PuppeDo can't resolve extended runner 'nonExistentRunner' in runner 'runner'");
  });

  it('должен выбрасывать ошибку при отсутствии расширяемых данных', () => {
    const runners: RunnerType[] = [
      {
        name: 'runner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        dataExt: ['nonExistentData'],
      },
    ];

    expect(() => {
      TestsContent.resolveRunners(runners, [], []);
    }).toThrow("PuppeDo can't resolve extended data 'nonExistentData' in runner 'runner'");
  });

  it('должен выбрасывать ошибку при отсутствии расширяемых селекторов', () => {
    const runners: RunnerType[] = [
      {
        name: 'runner',
        type: 'runner',
        browser: DEFAULT_BROWSER,
        selectorsExt: ['nonExistentSelectors'],
      },
    ];

    expect(() => {
      TestsContent.resolveRunners(runners, [], []);
    }).toThrow("PuppeDo can't resolve extended selectors 'nonExistentSelectors' in runner 'runner'");
  });

  it('должен корректно обрабатывать пустые расширения', () => {
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

  it('должен корректно объединять log, data, selectors и description при наследовании', () => {
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
        level: 'info', // из baseRunner
        screenshot: true, // из baseRunner
        fullpage: true, // из middleRunner
      },
      data: {
        key1: 'base1', // из baseRunner
        key2: 'middle2', // из middleRunner
        key3: 'final3', // из finalRunner
        shared: 'base', // из baseRunner, не перезаписывается
      },
      selectors: {
        sel1: '#base1', // из baseRunner
        sel2: '#middle2', // из middleRunner
        sel3: '#final3', // из finalRunner
        sharedSel: '#base', // из baseRunner, не перезаписывается
      },
      description: 'Final runner -> Middle runner -> Base runner',
    });
  });

  it('должен корректно обрабатывать отсутствующие опциональные поля', () => {
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

    // Проверяем, что отсутствующие поля инициализируются пустыми объектами
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

  it('должен корректно обрабатывать множественные расширения раннеров', () => {
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

  it('должен корректно обрабатывать browser из расширяемых раннеров', () => {
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

  it('должен обрабатывать отсутствующий testFile', () => {
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

  it('должен корректно обрабатывать пустые массивы расширений', () => {
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
});
