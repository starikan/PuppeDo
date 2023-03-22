import TestStructure from './TestStructure';
import getTest from './getTest';
import { Arguments } from './Arguments';
import Blocker from './Blocker';
import { Environment } from './Environment';
import { getTimer, getNowDateTime } from './Helpers';
import { ArgumentsType, LogEntry, RunOptions } from './global.d';
import { PluginsFabric } from './PluginsCore';

import { resolveOptions } from './Defaults';

const initEnvironment = (options: RunOptions, argsInput): string => {
  const { loggerPipes, pluginsList, argsConfig, stdOut, socket } = options;

  const { PPD_TESTS } = new Arguments(argsInput, argsConfig, true).args;

  if (!PPD_TESTS.length) {
    throw new Error('There is no tests to run. Pass any test in PPD_TESTS argument');
  }

  const allPlugins = new PluginsFabric(pluginsList);
  for (const plugin of pluginsList) {
    allPlugins.addPlugin(plugin);
  }

  const { envsId } = new Environment().createEnv({ socket, loggerOptions: { stdOut, loggerPipes } });

  return envsId;
};

const runTest = async (testName: string, envsId: string): Promise<Record<string, unknown>> => {
  const { timeStartBigInt } = getTimer();

  const { logger } = new Environment().getEnvInstance(envsId);

  await logger.log({ level: 'timer', text: `Test '${testName}' start on '${getNowDateTime()}'` });

  const fullJSON = new Environment().getStruct(envsId, testName);
  const textDescription = TestStructure.generateDescription(fullJSON);
  new Environment().setCurrent(envsId, { name: testName });

  new Blocker().reset();

  const test = getTest({ testJsonIncome: fullJSON, envsId });

  await logger.bulkLog([
    { level: 'env', text: `\n${textDescription}` },
    { level: 'timer', text: `Prepare time 🕝: ${getTimer({ timeStartBigInt }).deltaStr}` },
  ]);

  const testResults = await test();

  await logger.log({ level: 'timer', text: `Test '${testName}' time 🕝: ${getTimer({ timeStartBigInt }).deltaStr}` });

  return testResults;
};

const closeEnvironment = async (options: RunOptions, envsId: string): Promise<void> => {
  const { closeProcess, closeAllEnvs } = options;
  const { allRunners } = new Environment().getEnvInstance(envsId);

  if (closeAllEnvs) {
    await allRunners.closeAllRunners();
  }

  setTimeout(() => {
    if (closeProcess) {
      process.exit(0);
    }
  }, 0);
};

export default async function run(
  argsInput: Partial<ArgumentsType> = {},
  optionsInit: Partial<RunOptions> = {},
): Promise<{ results: Record<string, unknown>; logs: Record<string, unknown> }> {
  const results = {};
  const logs = {};

  const options = resolveOptions(optionsInit);
  const envsId = initEnvironment(options, argsInput);

  const { logger, log } = new Environment().getEnvInstance(envsId);
  const { PPD_TESTS } = new Arguments().args;

  if (options.debug) {
    await logger.log({ level: 'timer', text: `Args: ${JSON.stringify(new Arguments().args)}` });
  }

  try {
    const { timeStartBigInt } = getTimer();

    for (const testName of PPD_TESTS) {
      const testResults = await runTest(testName, envsId);

      // TODO: 2022-10-24 S.Starodubov Refactor this? It`s only for self tests
      const stepIds = Object.values(logs)
        .flat()
        .map((s: LogEntry) => s.stepId);
      logs[testName] = log.filter((v) => !stepIds.includes(v.stepId));
      results[testName] = testResults;
    }

    await logger.log({ level: 'timer', text: `Evaluated time 🕝: ${getTimer({ timeStartBigInt }).deltaStr}` });
    await closeEnvironment(options, envsId);

    console.log(JSON.stringify(results, null, 2));
    return { results, logs };
  } catch (error) {
    if (String(error).startsWith('SyntaxError') || String(error).startsWith('TypeError')) {
      error.debug = true;
      error.type = 'SyntaxError';
    }
    throw error;
  }
}
