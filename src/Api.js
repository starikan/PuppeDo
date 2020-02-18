/* eslint-disable no-await-in-loop */
const _ = require('lodash');
const dayjs = require('dayjs');

const { getFullDepthJSON } = require('./getFullDepthJSON');
const { getTest } = require('./getTest');
const { Arguments } = require('./Arguments');
const { Blocker } = require('./Blocker');
const Environment = require('./Environment.js');
const { Log } = require('./Log');

const run = async (argsInput = {}) => {
  let envsId;
  let envs;
  let log;
  try {
    const startTime = new Date();
    const args = new Arguments(argsInput);

    if (_.isEmpty(args.PPD_TESTS)) {
      throw new Error({ message: 'There is no tests to run. Pass any test in PPD_TESTS argument' });
    }

    if (_.isEmpty(args.PPD_ENVS)) {
      throw new Error({ message: 'There is no environments to run. Pass any test in PPD_ENVS argument' });
    }

    const initArgsTime = (new Date() - startTime) / 1000;

    for (let i = 0; i < args.PPD_TESTS.length; i += 1) {
      const startTimeTest = new Date();

      ({ envsId, envs } = Environment({ envsId }));
      envs.initOutput(args.PPD_TESTS[i]);
      envs.set('current.test', args.PPD_TESTS[i]);

      const logger = new Log({ envsId });
      log = logger.log.bind(logger);

      if (i === 0) {
        await log({ level: 'timer', text: `Init time 🕝: ${initArgsTime} sec.` });
      }
      await log({
        level: 'timer',
        text: `Test '${args.PPD_TESTS[i]}' start on '${dayjs(startTimeTest).format('YYYY-MM-DD HH:mm:ss.SSS')}'`,
      });

      await envs.init();

      const { fullJSON, textDescription } = getFullDepthJSON({ envsId });

      await log({ level: 'env', text: `\n${textDescription}`, testStruct: fullJSON });

      const blocker = new Blocker();
      blocker.refresh();
      const test = getTest(fullJSON, envsId);

      await log({
        level: 'timer',
        text: `Prepare time 🕝: ${(new Date() - startTimeTest) / 1000} sec.`,
      });

      await test();

      await log({
        level: 'timer',
        text: `Test '${args.PPD_TESTS[i]}' time 🕝: ${(new Date() - startTimeTest) / 1000} sec.`,
      });
    }

    await envs.closeBrowsers();
    await envs.closeProcesses();

    await log({
      level: 'timer',
      text: `Evaluated time 🕝: ${(new Date() - startTime) / 1000} sec.`,
    });

    if (!module.parent) {
      process.exit(1);
    }
  } catch (error) {
    error.message += " || error in 'run'";
    if (String(error).startsWith('SyntaxError')) {
      error.debug = true;
      error.type = 'SyntaxError';
    }
    throw error;
  }
};

module.exports = {
  run,
};
