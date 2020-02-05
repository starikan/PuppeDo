const _ = require('lodash');
const dayjs = require('dayjs');

const { getFullDepthJSON } = require('./getFullDepthJSON');
const { getTest } = require('./getTest');
const { Arguments } = require('./Arguments');
const { Blocker } = require('./Blocker');
const Environment = require('./env');
const Log = require('./Log');

const main = async (args = {}) => {
  let envsId, envs, log;
  try {
    const startTime = new Date();
    args = new Arguments(args);

    if (_.isEmpty(args.PPD_TESTS)) {
      throw { message: 'There is no tests to run. Pass any test in PPD_TESTS argument' };
    }

    if (_.isEmpty(args.PPD_ENVS)) {
      throw { message: 'There is no environments to run. Pass any test in PPD_ENVS argument' };
    }

    const initArgsTime = (new Date() - startTime) / 1000;

    for (let i = 0; i < args.PPD_TESTS.length; i++) {
      const startTimeTest = new Date();

      ({ envsId, envs } = Environment({ envsId }));
      const logger = new Log({ envsId });
      log = logger.log.bind(logger);

      envs.initOutput(args.PPD_TESTS[i]);
      envs.set('current.test', args.PPD_TESTS[i]);

      if (i === 0) {
        await log({ level: 'timer', text: `Init time 🕝: ${initArgsTime} sec.` });
      }
      await log({
        level: 'timer',
        text: `Test '${args.PPD_TESTS[i]}' start on '${dayjs(startTimeTest).format('YYYY-MM-DD HH:mm:ss.SSS')}'`,
      });

      await envs.init();

      const { fullJSON, textDescription } = getFullDepthJSON({ envsId });

      await log({ level: 'env', text: '\n' + textDescription, testStruct: fullJSON });

      const blocker = new Blocker();
      blocker.refresh();
      let test = getTest(fullJSON, envsId);

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
    error.message += ` || error in 'main'`;
    if (String(error).startsWith('SyntaxError')) {
      error.debug = true;
      error.type = 'SyntaxError';
    }
    throw error;
  }
};

module.exports = {
  main,
};
