const path = require('path');

const _ = require('lodash');

const TestsContent = require('./TestContent');
const { Arguments } = require('./Arguments');

describe('TestContent', () => {
  test('Init', () => {
    // Raw run
    let allData = new TestsContent();
    let instance = allData.__instance;
    expect(allData).toBeDefined();
    expect(allData.allFiles).toBeDefined();
    expect(allData.allContent).toBeDefined();
    expect(allData.atoms).toBeDefined();
    expect(allData.tests).toBeDefined();
    expect(allData.envs).toBeDefined();
    expect(allData.data).toBeDefined();
    expect(allData.selectors).toBeDefined();
    expect(allData.__instance).toBeDefined();

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
    allData = new TestsContent({rootFolder: 'tests', additionalFolders: ['goo'], ignorePaths: ['.git', 'node_modules', '.history', 'output', 'zoo']}, true);
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
});
