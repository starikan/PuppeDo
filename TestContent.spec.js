const _ = require('lodash');

const TestsContent = require('./TestContent');
const { Arguments } = require('./Arguments');

describe('TestContent', () => {
  test('Init', () => {
    let testsContent = new TestsContent();
    // expect(testsContent.allData).toBeDefined();
    // expect(testsContent.ignorePaths).toBeDefined();
    // expect(testsContent.rootFolder).toBeDefined();
    // expect(testsContent.additionalFolders).toBeDefined();

    expect(testsContent).toBeDefined();

    // new Arguments({ PPD_ROOT_IGNORE: ['foo'] }, true);
    // testsContent = new TestsContent({}, true);
    // expect(testsContent.ignorePaths).toEqual(['foo']);
  });

  test('Getting data', () => {
    const allData = new TestsContent();
    const allData2 = new TestsContent();
    expect(allData).toBeDefined();
    expect(allData).toEqual(allData2);
  });
});
