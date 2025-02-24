/* eslint-disable no-param-reassign */
import path from 'path';

import requireFromString from 'require-from-string';

import Blocker from './Blocker';
import { pick } from './Helpers';
import { Test } from './Test';
import Atom from './AtomCore';

import { LifeCycleFunction, TestArgsType, TestExtendType, TestLifeCycleFunctionType, TestType } from './global';
import { Environment } from './Environment';
import { Arguments } from './Arguments';

const atoms: Record<string, TestLifeCycleFunctionType> = {};

const resolveJS = (agentJson: TestExtendType): TestExtendType => {
  const { PPD_LIFE_CYCLE_FUNCTIONS } = new Arguments().args;
  const agentJsonNew = agentJson;

  const functions = pick<Record<string, LifeCycleFunction[] | unknown>>(
    agentJsonNew,
    PPD_LIFE_CYCLE_FUNCTIONS,
  ) as Record<string, LifeCycleFunction[]>;
  if (Object.values(functions).flat().length) {
    return agentJson;
  }

  try {
    if (agentJsonNew.inlineJS && typeof agentJsonNew.inlineJS === 'string') {
      try {
        atoms[agentJsonNew.inlineJS] = requireFromString(
          `module.exports = async function atomRun() {\n${agentJsonNew.inlineJS}};`,
        );
      } catch (error) {
        error.message = `Some errors in inlineJS: ${agentJsonNew.inlineJS}`;
        throw error;
      }
    } else {
      const testFileExt = path.parse(agentJsonNew.testFile).ext;
      const funcFile = path.resolve(agentJsonNew.testFile.replace(testFileExt, '.js'));
      atoms[agentJsonNew.name] =
        atoms[agentJsonNew.name] ||
        __non_webpack_require__(funcFile)[agentJsonNew.name] ||
        __non_webpack_require__(funcFile);
      agentJsonNew.funcFile = path.resolve(funcFile);
    }

    const instance = new Atom();
    instance.atomRun = atoms[agentJsonNew.inlineJS] || atoms[agentJsonNew.name];

    if (typeof instance.atomRun === 'function') {
      agentJsonNew.atomRun = [instance.runAtom.bind(instance)];
    }
  } catch (error) {
    if (error.name === 'SyntaxError') {
      throw error;
    }

    // If there is no JS file it`s fine.
    agentJsonNew.atomRun = [];
  }
  return agentJsonNew;
};

// todo навести порядок в этих типах
const propagateArgumentsObjectsOnAir = (
  source: TestExtendType,
  args: TestArgsType | undefined,
  list: string[] = [],
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
  list: string[] = [],
): TestExtendType => ({ ...source, ...pick(args || {}, list) });

const getAgent = ({
  agentJsonIncome,
  envsId,
  parentTestMetaCollector, // object for share data with sublings
}: {
  agentJsonIncome: TestExtendType;
  envsId: string;
  parentTestMetaCollector?: Partial<TestExtendType>;
}): TestLifeCycleFunctionType => {
  let agentJson = agentJsonIncome;

  const { PPD_LIFE_CYCLE_FUNCTIONS } = new Arguments().args;
  PPD_LIFE_CYCLE_FUNCTIONS.forEach((lcf) => {
    if (agentJson[lcf] && !Array.isArray(agentJson[lcf])) {
      throw new Error(`Block ${lcf} must be array. Path: '${(agentJson.breadcrumbs || []).join(' -> ')}'`);
    }
  });

  const functionsBeforeResolve: [string, TestExtendType[]][] = PPD_LIFE_CYCLE_FUNCTIONS.map((v) => [
    v,
    agentJson[v] as TestExtendType[],
  ]);

  const socket = new Environment().getSocket(envsId);

  agentJson = resolveJS(agentJson);
  agentJson.envsId = envsId;
  agentJson.socket = socket;

  const blocker = new Blocker();
  if (agentJson.stepId) {
    blocker.push({ stepId: agentJson.stepId, block: false, breadcrumbs: agentJson.breadcrumbs });
  }
  // Test
  // blocker.push({ stepId: agentJson.stepId, block: true, breadcrumbs: agentJson.breadcrumbs });

  functionsBeforeResolve.forEach((value) => {
    const [funcKey, funcVal] = value;
    if (funcVal) {
      const newFunctions = [] as TestLifeCycleFunctionType[];
      funcVal.forEach((testItem: TestType) => {
        const newFunction = getAgent({ agentJsonIncome: testItem, envsId, parentTestMetaCollector: agentJson });
        newFunctions.push(newFunction);
      });
      agentJson[funcKey] = newFunctions;
    }
  });

  const test = new Test(agentJson);

  const testResolver: TestLifeCycleFunctionType = async (args?: TestArgsType): Promise<Record<string, unknown>> => {
    if (parentTestMetaCollector?.stepId !== args?.stepId) {
      // it`s a magic and I don`t know why is this works, but it fix steps Id hierarchy
      if (parentTestMetaCollector?.repeat !== args?.repeat) {
        parentTestMetaCollector.stepId = args.stepId;
      }
      parentTestMetaCollector.resultsFromPrevSubling = {};
      parentTestMetaCollector.metaFromPrevSubling = {};
    }

    let updatetagentJson: TestExtendType = propagateArgumentsObjectsOnAir(
      agentJson,
      { ...args, ...(parentTestMetaCollector?.metaFromPrevSubling || {}) },
      ['options', 'data', 'selectors', 'logOptions'],
    );

    // TODO: 2022-10-06 S.Starodubov переделать получание этих вещей из значений плагина через хук, чтобы хук возвращал то что надо
    // TODO: 2023-03-20 S.Starodubov нормальную типизацию
    const fromPrevSublingSimple = test.plugins.getAllPropogatesAndSublings('fromPrevSublingSimple');
    updatetagentJson = propagateArgumentsSimpleOnAir(
      updatetagentJson,
      { ...args, ...(parentTestMetaCollector?.metaFromPrevSubling || {}) },
      ['debug', 'frame', ...Object.keys(fromPrevSublingSimple)],
    );

    updatetagentJson.resultsFromPrevSubling = parentTestMetaCollector?.resultsFromPrevSubling || {};
    updatetagentJson.metaFromPrevSubling = parentTestMetaCollector?.metaFromPrevSubling || {};

    const { stepId, name } = agentJson;
    const { stepId: stepIdParent } = args ?? {};

    const { testTree } = new Environment().getEnvInstance(agentJson.envsId);
    testTree.createStep({ stepIdParent: stepIdParent ?? null, stepId, payload: { ...fromPrevSublingSimple, name } });

    const { result = {}, meta = {} } = await test.run(updatetagentJson);

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

export default getAgent;
