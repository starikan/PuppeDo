import path from 'path';

import pick from 'lodash/pick';

import Blocker from './Blocker';
import { merge } from './Helpers';
import Test from './Test';

const RUNNER_BLOCK_NAMES = ['beforeTest', 'runTest', 'afterTest'];

const resolveJS = (testJson, funcFile) => {
  const testJsonNew = { ...testJson };
  try {
    /* eslint-disable */
    const atom = __non_webpack_require__(funcFile);
    /* eslint-enable */
    const { runTest } = atom;
    if (typeof runTest === 'function') {
      testJsonNew.funcFile = path.resolve(funcFile);
      testJsonNew.runTest = [runTest];
    }
  } catch (err) {
    // If there is no JS file it`s fine.
    testJsonNew.funcFile = 'No file';
    testJsonNew.runTest = [(): void => {}];
  }
  return testJsonNew;
};

const propagateArgumentsObjectsOnAir = (source = {}, args = {}, list = []): Object => {
  const result = { ...source };
  list.forEach((v) => {
    result[`${v}Parent`] = merge(result[v] || {}, args[v] || {});
  });
  return result;
};

const propagateArgumentsSimpleOnAir = (source = {}, args = {}, list = []): Object => {
  const result = { ...source };
  list.forEach((v) => {
    result[v] = result[v] || args[v];
  });
  return result;
};

const getTest = (testJsonIncome: Test, envsId: string, socket: SocketType, parentTest: any = {}) => {
  let testJson: any = { ...testJsonIncome };
  const functions = pick(testJson, RUNNER_BLOCK_NAMES);

  // Pass source code of test into test for logging
  testJson.source = { ...testJsonIncome };
  testJson.socket = socket;

  const blocker = new Blocker();
  blocker.push({ stepId: testJson.stepId, block: false, breadcrumbs: testJson.breadcrumbs });
  // Test
  // blocker.push({ stepId: testJson.stepId, block: true, breadcrumbs: testJson.breadcrumbs });

  // If there is no any function in test we decide that it have runTest in js file with the same name
  if (!Object.keys(functions).length && ['atom'].includes(testJson.type)) {
    const testFileExt = path.parse(testJson.testFile).ext;
    const funcFile = path.resolve(testJson.testFile.replace(testFileExt, '.js'));
    testJson = resolveJS(testJson, funcFile);
  } else {
    Object.entries(functions).forEach((v) => {
      const [funcKey, funcVal] = v;
      // Resolve nested
      if (Array.isArray(funcVal)) {
        testJson[funcKey] = [];
        funcVal.forEach((test) => {
          if (['test', 'atom'].includes(test.type)) {
            testJson[funcKey].push(getTest(test, envsId, socket, testJson));
          }
        });
      } else {
        throw new Error(`Block ${funcKey} must be array. Path: '${testJson.breadcrumbs.join(' -> ')}'`);
      }
    });
  }

  const test = new Test(testJson);

  return async (args = {}) => {
    let updatetTestJson: InputsTestType = propagateArgumentsObjectsOnAir(testJson, args, [
      'options',
      'data',
      'selectors',
    ]);
    updatetTestJson = propagateArgumentsSimpleOnAir(updatetTestJson, args, ['debug']);
    updatetTestJson.resultsFromParent = parentTest?.resultsFromChildren || {};
    const result = await test.run(envsId, updatetTestJson);
    // eslint-disable-next-line no-param-reassign
    parentTest.resultsFromChildren = { ...parentTest.resultsFromChildren, ...result };
    return result;
  };
};

export default getTest;
