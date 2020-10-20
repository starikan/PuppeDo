import path from 'path';

import Blocker from './Blocker';
import { merge, pick } from './Helpers';
import { Test } from './Test';
import Atom from './AtomCore';

import { InputsTestType, SocketType, TestArgsExtType, TestLifecycleFunctionType } from './global.d';

const RUNNER_BLOCK_NAMES = ['beforeTest', 'runTest', 'afterTest'];

const resolveJS = (testJson: any, funcFile: string): any => {
  const testJsonNew = { ...testJson };
  try {
    const instance = new Atom();
    // eslint-disable-next-line no-undef
    const atomRun = __non_webpack_require__(funcFile);
    instance.atomRun = atomRun;
    if (typeof atomRun === 'function') {
      testJsonNew.funcFile = path.resolve(funcFile);
      testJsonNew.runTest = [instance.runTest.bind(instance)];
    }
  } catch (err) {
    // If there is no JS file it`s fine.
    testJsonNew.runTest = [
      (): void => {
        // Do nothig
      },
    ];
  }
  return testJsonNew;
};

const propagateArgumentsObjectsOnAir = (source = {}, args = {}, list = []): Record<string, unknown> => {
  const result = { ...source };
  list.forEach((v: string) => {
    result[`${v}Parent`] = merge(result[v] || {}, args[v] || {});
  });
  return result;
};

const propagateArgumentsSimpleOnAir = (source = {}, args = {}, list = []): Record<string, unknown> => {
  const result = { ...source };
  list.forEach((v) => {
    result[v] = result[v] || args[v];
  });
  return result;
};

const getTest = (
  testJsonIncome: any,
  envsId: string,
  socket: SocketType,
  parentTest: any = {},
): { test: TestLifecycleFunctionType; blocker: Blocker } => {
  let testJson = { ...testJsonIncome };
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
            testJson[funcKey].push(getTest(test, envsId, socket, testJson).test);
          }
        });
      } else {
        throw new Error(`Block ${funcKey} must be array. Path: '${testJson.breadcrumbs.join(' -> ')}'`);
      }
    });
  }

  const test = new Test(testJson);

  return {
    test: async (args: TestArgsExtType | null): Promise<Record<string, unknown>> => {
      let updatetTestJson: InputsTestType = propagateArgumentsObjectsOnAir(testJson, args || {}, [
        'options',
        'data',
        'selectors',
        'logOptions',
      ]);
      updatetTestJson = propagateArgumentsSimpleOnAir(updatetTestJson, args || {}, ['debug', 'frame']);
      updatetTestJson.resultsFromParent = parentTest?.resultsFromChildren || {};
      const result = await test.run(envsId, updatetTestJson);
      // eslint-disable-next-line no-param-reassign
      parentTest.resultsFromChildren = { ...(parentTest?.resultsFromChildren || {}), ...result };
      return result;
    },
    blocker,
  };
};

export default getTest;
