const path = require('path');

const TestsContent = require('../dist/TestContent').default;
const Arguments = require('../dist/Arguments').default;

describe('TestContent', () => {
  test('Init', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    // Raw run
    let allData = new TestsContent();
    let instance = allData.__instance;
    expect(console.log).toHaveBeenCalled();
    spy.mockRestore();
    expect(instance.ignorePaths).toEqual(['.git', 'node_modules', '.history', 'output']);
    expect(instance.rootFolder).toEqual(process.cwd());
    expect(instance.additionalFolders).toEqual([]);

    // Global Arguments run
    new Arguments(
      {
        PPD_ROOT_IGNORE: ['.git', 'node_modules', '.history', 'output', 'foo'],
        PPD_ROOT_ADDITIONAL: ['bar'],
        PPD_ROOT: 'tests',
      },
      true,
    );
    allData = new TestsContent({}, true);
    instance = allData.__instance;
    expect(instance.ignorePaths).toEqual(['.git', 'node_modules', '.history', 'output', 'foo']);
    expect(instance.rootFolder).toEqual(path.normalize('tests'));
    expect(instance.additionalFolders).toEqual(['bar']);

    // Args run
    new Arguments(
      {
        PPD_ROOT_IGNORE: ['.git', 'node_modules', '.history', 'output', 'foo'],
        PPD_ROOT_ADDITIONAL: ['bar'],
        PPD_ROOT: 'tests_dee',
      },
      true,
    );
    allData = new TestsContent(
      {
        rootFolder: 'tests',
        additionalFolders: 'goo',
        ignorePaths: '.git,node_modules , .history    , output,zoo',
      },
      true,
    );
    instance = allData.__instance;
    expect(instance.ignorePaths).toEqual(['.git', 'node_modules', '.history', 'output', 'zoo']);
    expect(instance.rootFolder).toEqual(path.normalize('tests'));
    expect(instance.additionalFolders).toEqual(['goo']);
  });

  test('Getting data', () => {
    const allData = new TestsContent();
    const allData2 = new TestsContent();
    expect(allData).toBeDefined();
    expect(allData).toEqual(allData2);
  });

  test('getAllData', () => {
    let allData = new TestsContent();
    instance = allData.__instance;
    expect(allData).toBeDefined();
    expect(allData.allFiles).toBeDefined();
    expect(allData.allContent).toBeDefined();
    expect(allData.atoms).toBeDefined();
    expect(allData.tests).toBeDefined();
    expect(allData.envs).toBeDefined();
    expect(allData.data).toBeDefined();
    expect(allData.selectors).toBeDefined();
    expect(allData.__instance).toBeDefined();

    expect(instance.getAllData()).toEqual(allData);

    instance.rootFolder = 'notExistFolder';
    instance.additionalFolders = [];
    allData = instance.getAllData(true);
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

    const data = [
      { type: 'foo', name: 'bar' },
      { type: 'foo', name: 'goo' },
      { type: 'foo', name: 'zoo' },
      { type: 'foo', name: 'daa' },
    ];
    expect(CD(data, 'foo')).toBe(true);

    expect(() => CD([{}], 'foo')).toThrow(new Error("There is no name of 'foo' in files:\n"));
    expect(() => CD([{ name: '' }], 'foo')).toThrow(new Error("There is no name of 'foo' in files:\n"));
    expect(() => CD([{ name: '', testFile: 'bar' }], 'foo')).toThrow(
      new Error("There is no name of 'foo' in files:\nbar"),
    );

    const testsObjects1 = [
      { name: '', testFile: 'bar' },
      { name: '', testFile: 'tyy' },
    ];
    expect(() => CD(testsObjects1, 'foo')).toThrow(new Error("There is no name of 'foo' in files:\nbar\ntyy"));

    const testsObjects2 = [
      { name: 'puu', testFile: 'lee' },
      { name: 'dee', testFile: 'bar' },
      { name: 'dee', testFile: 'tyy' },
    ];
    // TODO: ПОчему этот тест проходит хотя message вобще то нет
    expect(() => CD(testsObjects2, 'foo')).toThrow(
      new Error(
        `There is duplicates of 'foo':
 - Name: 'dee'.
    * 'bar'
    * 'tyy'
`,
      ),
    );
  });
});
