import TestStructure from './TestStructure';
import getTest from './getTest';
import { Arguments } from './Arguments';
import Blocker from './Blocker';
import { Environment } from './Environment';
import { getTimer, getNowDateTime } from './Helpers';
import { LogEntry } from './global.d';
import { pluginsList } from './Plugins';
import { PluginModule, PluginsFabric } from './PluginsCore';

type RunOptions = {
  closeProcess?: boolean;
  stdOut?: boolean;
  closeAllEnvs?: boolean;
  globalConfigFile?: string;
  plugins?: PluginModule<unknown>[];
};

export default async function run(
  argsInput = {},
  options: RunOptions = {},
): Promise<{ results: Record<string, unknown>; logs: Record<string, unknown> }> {
  const allPlugins = new PluginsFabric(pluginsList);
  for (const plugin of options.plugins || []) {
    allPlugins.addPlugin(plugin);
  }

  const { closeProcess = true, stdOut = true, closeAllEnvs = true, globalConfigFile } = options;
  const { envsId, env, logger, log } = new Environment().createEnv({ loggerOptions: { stdOut } });

  const { PPD_TESTS, PPD_DEBUG_MODE } = new Arguments({ ...argsInput }, true, globalConfigFile).args;
  const argsTests = PPD_TESTS.filter((v) => !!v);

  if (PPD_DEBUG_MODE) {
    console.log(JSON.stringify(allPlugins.getPluginsOrder(), null, 2));
  }

  const results = {};
  const logs = {};

  if (!argsTests.length) {
    throw new Error('There is no tests to run. Pass any test in PPD_TESTS argument');
  }

  try {
    const startTime = getTimer().now;

    for (const testName of argsTests) {
      const startTimeTest = getTimer().now;

      await logger.log({ level: 'timer', text: `Test '${testName}' start on '${getNowDateTime()}'` });

      env.setCurrentTest(testName);

      const { fullJSON, textDescription } = new TestStructure(testName);
      new Blocker().reset();
      const test = getTest({ testJsonIncome: fullJSON, envsId });

      await logger.log({ level: 'env', text: `\n${textDescription}` });
      await logger.log({ level: 'timer', text: `Prepare time 🕝: ${getTimer(startTimeTest).delta}` });
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
      await env.closeAllEnvs();
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
