import TestStructure from './TestStructure';
import getTest from './getTest';
import { Arguments } from './Arguments';
import Blocker from './Blocker';
import { Environment } from './Environment';
import { getTimer, getNowDateTime } from './Helpers';
import { LogEntry, RunOptions } from './global.d';
import { PluginsFabric } from './PluginsCore';

import { resolveOptions } from './Defaults';

export default async function run(
  argsInput = {},
  options: RunOptions = {},
): Promise<{ results: Record<string, unknown>; logs: Record<string, unknown> }> {
  const { loggerPipes, pluginsList, argsConfig } = resolveOptions(options);

  const { PPD_TESTS, PPD_DEBUG_MODE } = new Arguments(argsInput, argsConfig, true).args;

  const allPlugins = new PluginsFabric(pluginsList);
  for (const plugin of pluginsList) {
    allPlugins.addPlugin(plugin);
  }

  const { closeProcess = true, stdOut = true, closeAllEnvs = true } = options;
  const { envsId, allRunners, logger, log } = new Environment().createEnv({ loggerOptions: { stdOut, loggerPipes } });

  if (PPD_DEBUG_MODE) {
    console.log(JSON.stringify(allPlugins.getPluginsOrder(), null, 2));
  }

  const results = {};
  const logs = {};

  if (!PPD_TESTS.length) {
    throw new Error('There is no tests to run. Pass any test in PPD_TESTS argument');
  }

  try {
    const startTime = getTimer().now;

    for (const testName of PPD_TESTS) {
      const startTimeTest = getTimer().now;

      await logger.log({ level: 'timer', text: `Test '${testName}' start on '${getNowDateTime()}'` });

      new Environment().setCurrent(envsId, { name: testName });

      const fullJSON = TestStructure.getFullDepthJSON(testName);
      const textDescription = TestStructure.generateDescription(fullJSON);

      new Blocker().reset();
      const test = getTest({ testJsonIncome: fullJSON, envsId });

      await logger.bulkLog([
        { level: 'env', text: `\n${textDescription}` },
        { level: 'timer', text: `Prepare time 🕝: ${getTimer(startTimeTest).delta}` },
      ]);
      const testResults = await test();

      await logger.log({ level: 'timer', text: `Test '${testName}' time 🕝: ${getTimer(startTimeTest).delta}` });

      results[testName] = testResults;

      // TODO: 2022-10-24 S.Starodubov Refactor this? It`s only for self tests
      const stepIds = Object.values(logs)
        .flat()
        .map((s: LogEntry) => s.stepId);
      logs[testName] = log.filter((v) => !stepIds.includes(v.stepId));
    }

    if (closeAllEnvs) {
      await allRunners.closeAllRunners();
    }

    await logger.log({ level: 'timer', text: `Evaluated time 🕝: ${getTimer(startTime).delta}` });

    setTimeout(() => {
      if (closeProcess) {
        process.exit(0);
      }
    }, 0);

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
