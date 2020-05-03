/* eslint-disable no-await-in-loop */
import _ from 'lodash';
import dayjs from 'dayjs';

import getFullDepthJSON from './getFullDepthJSON';
import getTest from './getTest';
import Arguments from './Arguments';
import Blocker from './Blocker';
import Environment from './Environment';
import Log from './Log';

// eslint-disable-next-line no-undef
__non_webpack_require__('source-map-support').install();

const run = async (argsInput = {}) => {
  let envsId;
  let envs;
  let log;
  try {
    const startTime = new Date().getTime();
    const args = { ...new Arguments(argsInput).args };

    if (_.isEmpty(args.PPD_TESTS)) {
      throw new Error('There is no tests to run. Pass any test in PPD_TESTS argument');
    }

    if (_.isEmpty(args.PPD_ENVS)) {
      throw new Error('There is no environments to run. Pass any test in PPD_ENVS argument');
    }

    const initArgsTime = (new Date().getTime() - startTime) / 1000;

    for (let i = 0; i < args.PPD_TESTS.length; i += 1) {
      const startTimeTest = new Date().getTime();

      ({ envsId, envs } = Environment(envsId));
      envs.initOutput(args.PPD_TESTS[i]);
      envs.set('current.test', args.PPD_TESTS[i]);

      const logger = new Log(envsId);
      log = logger.log.bind(logger);

      if (i === 0) {
        await log({ level: 'timer', text: `Init time 🕝: ${initArgsTime} sec.` });
      }
      await log({
        level: 'timer',
        text: `Test '${args.PPD_TESTS[i]}' start on '${dayjs(startTimeTest).format('YYYY-MM-DD HH:mm:ss.SSS')}'`,
      });

      await envs.init(false);

      const { fullJSON, textDescription } = getFullDepthJSON({ envsId });

      await log({ level: 'env', text: `\n${textDescription}`, testStruct: fullJSON });

      const blocker = new Blocker();
      blocker.refresh();

      const test = getTest(fullJSON, envsId);

      await envs.runBrowsers();

      await log({
        level: 'timer',
        text: `Prepare time 🕝: ${(new Date().getTime() - startTimeTest) / 1000} sec.`,
      });

      await test();

      await log({
        level: 'timer',
        text: `Test '${args.PPD_TESTS[i]}' time 🕝: ${(new Date().getTime() - startTimeTest) / 1000} sec.`,
      });
    }

    await envs.closeBrowsers();
    await envs.closeProcesses();

    await log({
      level: 'timer',
      text: `Evaluated time 🕝: ${(new Date().getTime() - startTime) / 1000} sec.`,
    });

    if (!module.parent) {
      process.exit(1);
    }
  } catch (error) {
    error.message += " || error in 'run'";
    if (String(error).startsWith('SyntaxError') || String(error).startsWith('TypeError')) {
      error.debug = true;
      error.type = 'SyntaxError';
    }
    throw error;
  }
};

export default run;
