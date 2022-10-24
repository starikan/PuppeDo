/* eslint-disable no-param-reassign */
import path from 'path';

import requireFromString from 'require-from-string';

import Blocker from './Blocker';
import { pick, RUNNER_BLOCK_NAMES } from './Helpers';
import { Test } from './Test';
import Atom from './AtomCore';

import {
  TestArgsType,
  TestExtendType,
  TestExtendTypeKeys,
  TestFunctionsBlockNames,
  TestLifecycleFunctionType,
  TestType,
} from './global.d';
import { Environment } from './Environment';

const atoms: Record<string, TestLifecycleFunctionType> = {};

const resolveJS = (testJson: TestExtendType): TestExtendType => {
  const testJsonNew = testJson;

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
      atoms[testJsonNew.name] =
        atoms[testJsonNew.name] ||
        __non_webpack_require__(funcFile)[testJsonNew.name] ||
        __non_webpack_require__(funcFile);
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

const propagateArgumentsObjectsOnAir = (
  source: TestExtendType,
  args: TestArgsType | undefined,
  list: TestExtendTypeKeys[] = [],
): TestExtendType => {
  const sourceValues = pick(source || {}, list);
  const argsValues = pick(args || {}, list);
  const renamedKeys = Object.fromEntries(
    Object.entries({ ...sourceValues, ...argsValues }).map((v) => [`${v[0]}Parent`, v[1]]),
  );
  return { ...source, ...renamedKeys };
};

const propagateArgumentsSimpleOnAir = (
  source: TestExtendType,
  args: TestArgsType | undefined,
  list: (TestExtendTypeKeys | string)[] = [],
): TestExtendType => ({ ...source, ...pick(args || {}, list) });

const getTest = ({
  testJsonIncome,
  envsId,
  parentTestMetaCollector, // object for share data with sublings
}: {
  testJsonIncome: TestExtendType;
  envsId: string;
  parentTestMetaCollector?: Partial<TestExtendType>;
}): TestLifecycleFunctionType => {
  let testJson = testJsonIncome;

  RUNNER_BLOCK_NAMES.forEach((funcBlock) => {
    if (testJson[funcBlock] && !Array.isArray(testJson[funcBlock])) {
      throw new Error(`Block ${funcBlock} must be array. Path: '${(testJson.breadcrumbs || []).join(' -> ')}'`);
    }
  });

  const functionsBeforeResolve: [TestFunctionsBlockNames, TestExtendType[]][] = RUNNER_BLOCK_NAMES.map((v) => [
    v,
    testJson[v] as TestExtendType[],
  ]);

  const socket = new Environment().getSocket(envsId);

  testJson = resolveJS(testJson);
  testJson.envsId = envsId;
  testJson.socket = socket;

  const blocker = new Blocker();
  if (testJson.stepId) {
    blocker.push({ stepId: testJson.stepId, block: false, breadcrumbs: testJson.breadcrumbs });
  }
  // Test
  // blocker.push({ stepId: testJson.stepId, block: true, breadcrumbs: testJson.breadcrumbs });

  functionsBeforeResolve.forEach((value) => {
    const [funcKey, funcVal] = value;
    if (funcVal && !testJson.inlineJS) {
      const newFunctions = [] as TestLifecycleFunctionType[];
      funcVal.forEach((testItem: TestType) => {
        if (['test', 'atom'].includes(testItem.type)) {
          const newFunction = getTest({ testJsonIncome: testItem, envsId, parentTestMetaCollector: testJson });
          newFunctions.push(newFunction);
        }
      });
      testJson[funcKey] = newFunctions;
    }
  });

  const test = new Test(testJson);

  const testResolver: TestLifecycleFunctionType = async (args?: TestArgsType): Promise<Record<string, unknown>> => {
    if (parentTestMetaCollector?.stepId !== args?.stepId) {
      parentTestMetaCollector.stepId = args.stepId;
      parentTestMetaCollector.resultsFromPrevSubling = {};
      parentTestMetaCollector.metaFromPrevSubling = {};
    }

    let updatetTestJson: TestExtendType = propagateArgumentsObjectsOnAir(
      testJson,
      { ...args, ...(parentTestMetaCollector?.metaFromPrevSubling || {}) },
      ['options', 'data', 'selectors', 'logOptions'],
    );

    // TODO: 2022-10-06 S.Starodubov переделать получание этих вещей из значений плагина через хук, чтобы хук возвращал то что надо
    const fromPrevSublingSimple = test.plugins.getAllPropogatesAndSublings('fromPrevSublingSimple');
    updatetTestJson = propagateArgumentsSimpleOnAir(
      updatetTestJson,
      { ...args, ...(parentTestMetaCollector?.metaFromPrevSubling || {}) },
      ['debug', 'frame', ...Object.keys(fromPrevSublingSimple)],
    );

    updatetTestJson.resultsFromPrevSubling = parentTestMetaCollector?.resultsFromPrevSubling || {};
    updatetTestJson.metaFromPrevSubling = parentTestMetaCollector?.metaFromPrevSubling || {};

    const { result = {}, meta = {} } = await test.run(updatetTestJson);

    if (parentTestMetaCollector) {
      parentTestMetaCollector.resultsFromPrevSubling = {
        ...(parentTestMetaCollector?.resultsFromPrevSubling || {}),
        ...result,
      };
      parentTestMetaCollector.metaFromPrevSubling = meta;
    }

    return result;
  };

  return testResolver;
};

export default getTest;
