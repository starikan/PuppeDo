const dayjs = require('dayjs');
const { getFullDepthJSON } = require('./getFullDepthJSON');
const { getTest } = require('./getTest');
const { Arguments } = require('./Arguments');
const { Blocker } = require('./Blocker');
const Environment = require('./env');

const main = async (args = {}) => {
  let envsId, envs, log;
  try {
    const startTime = new Date();
    args = new Arguments(args);
    console.log(`Init time 🕝: ${(new Date() - startTime) / 1000} sec.`);

    for (let i = 0; i < args.PPD_TESTS.length; i++) {
      const startTimeTest = new Date();
      console.log(
        `\n\nTest '${args.PPD_TESTS[i]}' start on '${dayjs(startTimeTest).format('YYYY-MM-DD HH:mm:ss.SSS')}'`,
      );

      ({ envsId, envs, log } = Environment({ envsId }));
      await envs.init();
      envs.set('current.test', args.PPD_TESTS[i]);
      envs.initOutput();

      const { fullJSON, textDescription } = getFullDepthJSON({ envsId });

      log({ level: 'env', text: '\n' + textDescription, testStruct: fullJSON });

      const blocker = new Blocker();
      blocker.refresh();
      let test = getTest(fullJSON, envsId);

      console.log(`Prepate time 🕝: ${(new Date() - startTimeTest) / 1000} sec.`);

      await test();
      console.log(`Test '${args.currentTest}' time 🕝: ${(new Date() - startTimeTest) / 1000} sec.`);
    }

    // await envs.closeBrowsers();
    // await envs.closeProcesses();
    // console.log(`\n\nEvaluated time 🕝: ${(new Date() - startTime) / 1000} sec.`);

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
