import path from 'path';

import TestsContent from '../src/TestContent';
import { Arguments } from '../src/Arguments';

import { DataType, EnvBrowserType, TestExtendType } from '../src/global.d';

describe('TestContent', () => {
  test('Init', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    const { ignorePaths, rootFolder, additionalFolders } = new TestsContent();
    expect(console.log).toHaveBeenCalled();
    spy.mockRestore();
    expect(ignorePaths).toEqual(['.git', 'node_modules', '.history', 'output', '.github', '.vscode']);
    expect(rootFolder).toEqual(process.cwd());
    expect(additionalFolders).toEqual([]);
  });

  test('Init with args', () => {
    // eslint-disable-next-line no-new
    new Arguments(
      {
        PPD_ROOT_IGNORE: ['.git', 'node_modules', '.history', 'output', 'foo'],
        PPD_ROOT_ADDITIONAL: ['bar'],
        PPD_ROOT: 'tests',
      },
      true,
    );
    const { ignorePaths, rootFolder, additionalFolders } = new TestsContent(true);
    expect(ignorePaths).toEqual(['.git', 'node_modules', '.history', 'output', 'foo']);
    expect(rootFolder).toEqual(path.normalize('tests'));
    expect(additionalFolders).toEqual(['bar']);
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
    expect(allData.envs).toBeDefined();
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
      true,
    );

    const allData = new TestsContent(true).getAllData(true);
    expect(allData.allFiles).toEqual([]);
    expect(allData.allContent).toEqual([]);
    expect(allData.atoms).toEqual([]);
    expect(allData.tests).toEqual([]);
    expect(allData.envs).toEqual([]);
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
        descriptionError: '',
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
        argsRedefine: {},
        continueOnError: false,
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
        descriptionError: '',
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
        argsRedefine: {},
        continueOnError: false,
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
        descriptionError: '',
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
        argsRedefine: {},
        continueOnError: false,
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
        descriptionError: '',
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
        argsRedefine: {},
        continueOnError: false,
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
    expect(() => CD([{ name: '', testFile: 'bar', type: 'env', browser: DEFAULT_BROWSER }])).toThrow(
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
