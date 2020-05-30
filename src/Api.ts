/* eslint-disable no-await-in-loop */
import dayjs from 'dayjs';

import TestStructure from './TestStructure';
import getTest from './getTest';
import Arguments from './Arguments';
import Blocker from './Blocker';
import Environment from './Environment';
import Log from './Log';
import { getTimer, blankSocket } from './Helpers';

// eslint-disable-next-line no-undef
__non_webpack_require__('source-map-support').install();

const run = async (argsInput = {}, closeProcess: boolean = true): Promise<void> => {
  const { envsId, envsPool: envs } = Environment();
  const logger = new Log(envsId);
  const log = logger.log.bind(logger);
  const socket = blankSocket;
  const blocker = new Blocker();

  try {
    const startTime = process.hrtime.bigint();
    const args = { ...new Arguments(argsInput, true).args };

    if (!args.PPD_TESTS.length) {
      throw new Error('There is no tests to run. Pass any test in PPD_TESTS argument');
    }

    if (!args.PPD_ENVS.length) {
      throw new Error('There is no environments to run. Pass any test in PPD_ENVS argument');
    }

    const initArgsTime = getTimer(startTime);

    for (let i = 0; i < args.PPD_TESTS.length; i += 1) {
      const startTimeTest = process.hrtime.bigint();

      envs.setCurrentTest(args.PPD_TESTS[i]);

      if (i === 0) {
        await log({ level: 'timer', text: `Init time 🕝: ${initArgsTime} sec.` });
      }
      await log({
        level: 'timer',
        text: `Test '${args.PPD_TESTS[i]}' start on '${dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')}'`,
      });

      await envs.init(false);
      const { fullJSON, textDescription } = new TestStructure(envsId);
      const test = getTest(fullJSON, envsId, socket);
      await envs.runBrowsers();
      blocker.reset();

      await log({ level: 'env', text: `\n${textDescription}`, testStruct: fullJSON });
      await log({ level: 'timer', text: `Prepare time 🕝: ${getTimer(startTimeTest)} sec.` });

      await test();

      await log({ level: 'timer', text: `Test '${args.PPD_TESTS[i]}' time 🕝: ${getTimer(startTimeTest)} sec.` });
    }

    await envs.closeBrowsers();
    await envs.closeProcesses();

    await log({ level: 'timer', text: `Evaluated time 🕝: ${getTimer(startTime)} sec.` });

    // if (!module.parent) {
    if (closeProcess) {
      process.exit(0);
    }
    // }
  } catch (error) {
    error.message += " || error in 'run'";
    if (String(error).startsWith('SyntaxError') || String(error).startsWith('TypeError')) {
      error.debug = true;
      error.type = 'SyntaxError';
    }
    // eslint-disable-next-line no-console
    console.log(error);
    throw error;
  }
};

export default run;
