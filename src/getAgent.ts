/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-param-reassign */
import path from 'path';

import requireFromString from 'require-from-string';

import Blocker from './Blocker';
import { pick } from './Helpers';
import { Test } from './Test';
import Atom from './AtomCore';

import { LifeCycleFunction, TestArgsType, TestExtendType, TestLifeCycleFunctionType } from './global';
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
  parentStepMetaCollector, // object for share data with sublings
}: {
  agentJsonIncome: TestExtendType;
  envsId: string;
  parentStepMetaCollector?: Partial<TestExtendType>;
}): TestLifeCycleFunctionType => {
  let agentJson = agentJsonIncome;
  agentJson = resolveJS(agentJson);
  agentJson.envsId = envsId;
  agentJson.socket = new Environment().getSocket(envsId);

  if (agentJson.stepId) {
    const blocker = new Blocker();
    blocker.push({ stepId: agentJson.stepId, block: false, breadcrumbs: agentJson.breadcrumbs });
    // Test
    // blocker.push({ stepId: agentJson.stepId, block: true, breadcrumbs: agentJson.breadcrumbs });
  }

  const { PPD_LIFE_CYCLE_FUNCTIONS } = new Arguments().args;
  PPD_LIFE_CYCLE_FUNCTIONS.forEach((funcKey) => {
    if (agentJson[funcKey] && !Array.isArray(agentJson[funcKey])) {
      throw new Error(`Block ${funcKey} must be array. Path: '${(agentJson.breadcrumbs ?? []).join(' -> ')}'`);
    }
    if (agentJson[funcKey]) {
      const newFunctions = (agentJson[funcKey] as TestExtendType[]).map((item) =>
        getAgent({ agentJsonIncome: item, envsId, parentStepMetaCollector: agentJson }),
      );
      agentJson[funcKey] = newFunctions;
    }
  });

  return stepResolver(agentJson, parentStepMetaCollector);
};

const stepResolver = (
  agentJson: TestExtendType,
  parentStepMetaCollector: Partial<TestExtendType>,
): TestLifeCycleFunctionType => {
  const stepFunction = async (args?: TestArgsType): Promise<Record<string, unknown>> => {
    const step = new Test(agentJson);

    if (parentStepMetaCollector?.stepId !== args?.stepId) {
      // it`s a magic and I don`t know why is this works, but it fix steps Id hierarchy
      if (parentStepMetaCollector?.repeat !== args?.repeat) {
        parentStepMetaCollector.stepId = args.stepId;
      }
      parentStepMetaCollector.resultsFromPrevSubling = {};
      parentStepMetaCollector.metaFromPrevSubling = {};
    }

    // TODO: 2022-10-06 S.Starodubov переделать получание этих вещей из значений плагина через хук, чтобы хук возвращал то что надо
    // TODO: 2023-03-20 S.Starodubov нормальную типизацию
    const fromPrevSublingSimple = step.plugins.getAllPropogatesAndSublings('fromPrevSublingSimple');

    let updatedAgentJson: TestExtendType = propagateArgumentsObjectsOnAir(
      agentJson,
      { ...args, ...(parentStepMetaCollector?.metaFromPrevSubling ?? {}) },
      ['options', 'data', 'selectors', 'logOptions'],
    );

    updatedAgentJson = propagateArgumentsSimpleOnAir(
      updatedAgentJson,
      { ...args, ...(parentStepMetaCollector?.metaFromPrevSubling ?? {}) },
      ['debug', 'frame', ...Object.keys(fromPrevSublingSimple)],
    );

    updatedAgentJson.resultsFromPrevSubling = parentStepMetaCollector?.resultsFromPrevSubling ?? {};
    updatedAgentJson.metaFromPrevSubling = parentStepMetaCollector?.metaFromPrevSubling ?? {};

    const { stepId, name } = agentJson;
    const { stepId: stepIdParent } = args ?? {};

    const { testTree } = new Environment().getEnvInstance(agentJson.envsId);
    testTree.createStep({ stepIdParent: stepIdParent ?? null, stepId, payload: { ...fromPrevSublingSimple, name } });

    const { result = {}, meta = {} } = await step.run(updatedAgentJson);

    if (parentStepMetaCollector) {
      parentStepMetaCollector.resultsFromPrevSubling = {
        ...(parentStepMetaCollector?.resultsFromPrevSubling ?? {}),
        ...result,
      };
      parentStepMetaCollector.metaFromPrevSubling = meta;
    }

    return result;
  };

  return stepFunction;
};

export default getAgent;
