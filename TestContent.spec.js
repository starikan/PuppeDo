const path = require('path');

const _ = require('lodash');

const TestsContent = require('./TestContent');
const { Arguments } = require('./Arguments');

describe('TestContent', () => {
  test('Init', () => {
    // Raw run
    let allData = new TestsContent();
    let instance = allData.__instance;
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
    const allData = new TestsContent();
    const CD = allData.__instance.checkDuplicates;

    const data = [
      { type: 'foo', name: 'bar' },
      { type: 'foo', name: 'goo' },
      { type: 'foo', name: 'zoo' },
      { type: 'foo', name: 'daa' },
    ];
    expect(CD(data, 'foo')).toBe(true);

    expect(() => CD([{}], 'foo')).toThrow({ message: "There is no name of 'foo' in files:\n" });
    expect(() => CD([{ name: '' }], 'foo')).toThrow({ message: "There is no name of 'foo' in files:\n" });
    expect(() => CD([{ name: '', testFile: 'bar' }], 'foo')).toThrow({
      message: "There is no name of 'foo' in files:\nbar",
    });
    expect(() =>
      CD(
        [
          { name: '', testFile: 'bar' },
          { name: '', testFile: 'tyy' },
        ],
        'foo',
      ),
    ).toThrow({ message: "There is no name of 'foo' in files:\nbar\ntyy" });

    expect(() =>
      CD(
        [
          { name: 'dee', testFile: 'bar' },
          { name: 'dee', testFile: 'tyy' },
        ],
        'foo',
      ),
    ).toThrow({
      message: `There is duplicates of 'foo':
 - Name: 'dee'.
    * 'bar'
    * 'tyy'
`,
    });
  });
});
