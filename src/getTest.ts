import path from 'path';
import { parse, stringify } from 'flatted';

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

  let test = new Test(testJson);

  return {
    test: async (args: TestArgsExtType | null): Promise<Record<string, unknown>> => {
      let updatetTestJson: InputsTestType = propagateArgumentsObjectsOnAir(testJson, args || {}, [
        'options',
        'data',
        'selectors',
        'logOptions',
      ]);
      updatetTestJson = propagateArgumentsSimpleOnAir(updatetTestJson, args || {}, [
        'debug',
        'frame',
        'repeatsInParent',
      ]);
      updatetTestJson.resultsFromParent = parentTest?.resultsFromChildren || {};
      // debugger;
      const result = parse(stringify(await test.run(envsId, updatetTestJson)));
      // console.log('                  DELETE => ', test._id, test.repeat);
      // debugger;
      if (!test.repeatsInParent) {
        console.log('DELETED');
        delete test.runLogic;
        delete test.run;
        delete test.name;
        delete test.type;
        delete test.needEnv;
        delete test.needData;
        delete test.needSelectors;
        delete test.dataParent;
        delete test.selectorsParent;
        delete test.options;
        delete test.dataExt;
        delete test.selectorsExt;
        delete test.allowResults;
        delete test.beforeTest;
        delete test.runTest;
        delete test.afterTest;
        delete test.levelIndent;
        delete test.repeat;
        delete test.source;
        delete test.socket;
        delete test.stepId;
        delete test.breadcrumbs;
        delete test.funcFile;
        delete test.testFile;
        delete test.debug;
        delete test.debugInfo;
        delete test.disable;
        delete test.logOptions;
        delete test.frame;
        delete test.data;
        delete test.bindData;
        delete test.selectors;
        delete test.bindSelectors;
        delete test.bindResults;
        delete test.description;
        delete test.descriptionExtend;
        delete test.descriptionError;
        delete test.bindDescription;
        delete test.while;
        delete test.if;
        delete test.errorIf;
        delete test.errorIfResult;
        delete test.resultsFromChildren;
        delete test.resultsFromParent;
        delete test.tags;
        delete test.envName;
        delete test.envPageName;
        delete test.env;
        test = 0;
      }
      // eslint-disable-next-line no-param-reassign
      parentTest.resultsFromChildren = { ...(parentTest?.resultsFromChildren || {}), ...result };
      return result;
    },
    blocker,
  };
};

export default getTest;
