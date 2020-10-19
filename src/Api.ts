import TestStructure from './TestStructure';
import getTest from './getTest';
import { Arguments } from './Arguments';
import Blocker from './Blocker';
import Environment from './Environment';
import { getTimer, getNowDateTime } from './Helpers';

import { ArgumentsType } from './global.d';

// eslint-disable-next-line no-undef
__non_webpack_require__('source-map-support').install();

const checkArgs = (args: ArgumentsType): void => {
  if (!args.PPD_TESTS.length) {
    throw new Error('There is no tests to run. Pass any test in PPD_TESTS argument');
  }

  if (!args.PPD_ENVS.length) {
    throw new Error('There is no environments to run. Pass any test in PPD_ENVS argument');
  }

  args.PPD_TESTS.forEach((testName) => {
    if (!testName) {
      throw new Error('There is blank test name. Pass any test in PPD_TESTS argument');
    }
  });
};

export default async function run(argsInput = {}, closeProcess = true): Promise<void> {
  const { envsId, envsPool, socket, logger } = Environment();
  const args = { ...new Arguments(argsInput, true).args };
  checkArgs(args);

  try {
    const startTime = getTimer().now;

    for (let i = 0; i < args.PPD_TESTS.length; i += 1) {
      const startTimeTest = getTimer().now;
      const testName = args.PPD_TESTS[i];

      await logger.log({ level: 'timer', text: `Test '${testName}' start on '${getNowDateTime()}'` });

      envsPool.setCurrentTest(testName);

      const { fullJSON, textDescription } = new TestStructure(envsId, testName);
      new Blocker().reset();
      const { test } = getTest(fullJSON, envsId, socket);

      await logger.log({ level: 'env', text: `\n${textDescription}` });
      await logger.log({ level: 'timer', text: `Prepare time 🕝: ${getTimer(startTimeTest).delta} sec.` });
      await test(null);
      await logger.log({ level: 'timer', text: `Test '${testName}' time 🕝: ${getTimer(startTimeTest).delta} sec.` });
    }

    await envsPool.closeBrowsers();
    await envsPool.closeProcesses();

    await logger.log({ level: 'timer', text: `Evaluated time 🕝: ${getTimer(startTime).delta} sec.` });

    // if (!module.parent) {
    if (closeProcess) {
      process.exit(0);
    }
    // }
  } catch (error) {
    if (String(error).startsWith('SyntaxError') || String(error).startsWith('TypeError')) {
      error.debug = true;
      error.type = 'SyntaxError';
      // eslint-disable-next-line no-console
      console.log(error);
    }
    throw error;
  }
}
