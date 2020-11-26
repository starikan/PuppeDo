import path from 'path';

import requireFromString from 'require-from-string';

import Blocker from './Blocker';
import { pick, RUNNER_BLOCK_NAMES } from './Helpers';
import { Test } from './Test';
import Atom from './AtomCore';

import {
  InputsTestType,
  SocketType,
  TestArgsExtType,
  TestExtendType,
  TestLifecycleFunctionType,
  TestType,
} from './global.d';

const atoms = {};

const resolveJS = (testJson: TestExtendType): TestExtendType => {
  const testJsonNew = { ...testJson };

  const functions = pick(testJsonNew, RUNNER_BLOCK_NAMES);
  if (Object.keys(functions).length && !testJsonNew.inlineJS) {
    return testJson;
  }

  try {
    if (testJsonNew.inlineJS && typeof testJsonNew.inlineJS === 'string') {
      try {
        atoms[testJsonNew.inlineJS] = requireFromString(
          `module.exports = async function atomRun() {\n${testJsonNew.inlineJS}};`,
        );
      } catch (error) {
        error.message = `Some errors in inlineJS: ${testJsonNew.inlineJS}`;
        throw error;
      }
    } else {
      const testFileExt = path.parse(testJsonNew.testFile).ext;
      const funcFile = path.resolve(testJsonNew.testFile.replace(testFileExt, '.js'));
      atoms[testJsonNew.name] = atoms[testJsonNew.name] || __non_webpack_require__(funcFile);
      testJsonNew.funcFile = path.resolve(funcFile);
    }

    const instance = new Atom();
    instance.atomRun = atoms[testJsonNew.inlineJS] || atoms[testJsonNew.name];

    if (typeof instance.atomRun === 'function') {
      testJsonNew.runTest = [instance.runTest.bind(instance)];
    }
  } catch (error) {
    if (error.name === 'SyntaxError') {
      throw error;
    }

    // If there is no JS file it`s fine.
    testJsonNew.runTest = [];
  }
  return testJsonNew;
};

const propagateArgumentsObjectsOnAir = (source = {}, args = {}, list = []): Record<string, unknown> => {
  const result = { ...source };
  list.forEach((v: string) => {
    result[`${v}Parent`] = { ...(result[v] || {}), ...(args[v] || {}) };
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

const getTest = ({
  testJsonIncome,
  envsId,
  socket,
  parentTest,
}: {
  testJsonIncome: TestExtendType;
  envsId: string;
  socket: SocketType;
  parentTest?: TestExtendType;
}): { test: TestLifecycleFunctionType } => {
  let testJson = JSON.parse(JSON.stringify(testJsonIncome));

  RUNNER_BLOCK_NAMES.forEach((funcBlock) => {
    if (testJson[funcBlock] && !Array.isArray(testJson[funcBlock])) {
      throw new Error(`Block ${funcBlock} must be array. Path: '${testJson.breadcrumbs.join(' -> ')}'`);
    }
  });

  const functionsBeforeResolve = {
    beforeTest: testJson.beforeTest,
    runTest: testJson.runTest,
    afterTest: testJson.afterTest,
  };

  testJson = resolveJS(testJson);
  testJson.envsId = envsId;
  testJson.socket = socket;

  const blocker = new Blocker();
  blocker.push({ stepId: testJson.stepId, block: false, breadcrumbs: testJson.breadcrumbs });
  // Test
  // blocker.push({ stepId: testJson.stepId, block: true, breadcrumbs: testJson.breadcrumbs });

  RUNNER_BLOCK_NAMES.forEach((funcKey) => {
    const funcVal = functionsBeforeResolve[funcKey];
    if (funcVal && !testJson.inlineJS) {
      testJson[funcKey] = [];
      funcVal.forEach((testItem: TestType) => {
        if (['test', 'atom'].includes(testItem.type)) {
          testJson[funcKey].push(getTest({ testJsonIncome: testItem, envsId, socket, parentTest: testJson }).test);
        }
      });
    }
  });

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
      const result = await test.run(updatetTestJson);
      if (parentTest) {
        // eslint-disable-next-line no-param-reassign
        parentTest.resultsFromChildren = { ...(parentTest?.resultsFromChildren || {}), ...result };
      }
      return result;
    },
  };
};

export default getTest;
