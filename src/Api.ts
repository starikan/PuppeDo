/* eslint-disable no-await-in-loop */
import isEmpty from 'lodash/isEmpty';
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

const run = async (argsInput = {}) => {
  let envsId: string;
  let envs;
  let log;
  const socket = blankSocket;

  try {
    const startTime = process.hrtime.bigint();
    const args = { ...new Arguments(argsInput).args };

    if (isEmpty(args.PPD_TESTS)) {
      throw new Error('There is no tests to run. Pass any test in PPD_TESTS argument');
    }

    if (isEmpty(args.PPD_ENVS)) {
      throw new Error('There is no environments to run. Pass any test in PPD_ENVS argument');
    }

    const initArgsTime = getTimer(startTime);

    for (let i = 0; i < args.PPD_TESTS.length; i += 1) {
      const startTimeTest = process.hrtime.bigint();

      ({ envsId, envs } = Environment(envsId));
      envs.initOutput(args.PPD_TESTS[i]);
      envs.current.test = args.PPD_TESTS[i];

      const logger = new Log(envsId);
      log = logger.log.bind(logger);

      if (i === 0) {
        await log({ level: 'timer', text: `Init time 🕝: ${initArgsTime} sec.` });
      }
      await log({
        level: 'timer',
        text: `Test '${args.PPD_TESTS[i]}' start on '${dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')}'`,
      });

      await envs.init(false);

      const { fullJSON, textDescription } = new TestStructure(envsId);

      await log({ level: 'env', text: `\n${textDescription}`, testStruct: fullJSON });

      const blocker = new Blocker();
      blocker.refresh();

      const test = getTest(fullJSON, envsId, socket);

      await envs.runBrowsers();

      await log({
        level: 'timer',
        text: `Prepare time 🕝: ${getTimer(startTimeTest)} sec.`,
      });

      await test();

      await log({
        level: 'timer',
        text: `Test '${args.PPD_TESTS[i]}' time 🕝: ${getTimer(startTimeTest)} sec.`,
      });
    }

    await envs.closeBrowsers();
    await envs.closeProcesses();

    await log({
      level: 'timer',
      text: `Evaluated time 🕝: ${getTimer(startTime)} sec.`,
    });

    // if (!module.parent) {
    process.exit(0);
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
