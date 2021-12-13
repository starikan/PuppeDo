import TestStructure from './TestStructure';
import getTest from './getTest';
import { Arguments } from './Arguments';
import Blocker from './Blocker';
import Environment from './Environment';
import { getTimer, getNowDateTime } from './Helpers';
import { LogEntry } from './global.d';

type RunOptions = {
  closeProcess?: boolean;
  stdOut?: boolean;
};

export default async function run(
  argsInput = {},
  options: RunOptions = {},
): Promise<{ results: Record<string, unknown>; logs: Record<string, unknown> }> {
  const { envsId, envsPool, socket, logger } = Environment();
  const { closeProcess = true, stdOut = true } = options;
  logger.bindData({ stdOut });
  const { PPD_TESTS } = new Arguments({ ...argsInput }, true).args;
  const argsTests = PPD_TESTS.filter((v) => !!v);

  const results = {};
  const logs = {};

  if (!argsTests.length) {
    throw new Error('There is no tests to run. Pass any test in PPD_TESTS argument');
  }

  try {
    const startTime = getTimer().now;

    for (let i = 0; i < argsTests.length; i += 1) {
      const startTimeTest = getTimer().now;
      const testName = argsTests[i];

      await logger.log({ level: 'timer', text: `Test '${testName}' start on '${getNowDateTime()}'` });

      envsPool.setCurrentTest(testName);

      const { fullJSON, textDescription } = new TestStructure(testName);
      new Blocker().reset();
      const test = getTest({ testJsonIncome: fullJSON, envsId, socket });

      await logger.log({ level: 'env', text: `\n${textDescription}` });
      await logger.log({ level: 'timer', text: `Prepare time 🕝: ${getTimer(startTimeTest).delta}` });
      const testResults = await test();

      await logger.log({ level: 'timer', text: `Test '${testName}' time 🕝: ${getTimer(startTimeTest).delta}` });

      results[testName] = testResults;

      const stepIds = Object.values(logs)
        .flat()
        .map((s: LogEntry) => s.stepId);
      logs[testName] = envsPool.log.filter((v) => !stepIds.includes(v.stepId));
    }

    await envsPool.closeAllEnvs();

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
