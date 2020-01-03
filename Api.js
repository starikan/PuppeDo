const dayjs = require('dayjs');
const { getFullDepthJSON } = require('./getFullDepthJSON');
const { getTest } = require('./getTest');
const { TestsContent } = require('./TestContent');
const { Arguments } = require('./Arguments');
const { Blocker } = require('./Blocker');
const Environment = require('./env');

const main = async (args = {}) => {
  try {
    const startTime = new Date();

    let envsIdGlob, envsGlob;
    args = new Arguments(args);
    const testContent = new TestsContent().getAllData();

    console.log(`Init time 🕝: ${(new Date() - startTime) / 1000} sec.`);

    for (let i = 0; i < args.PPD_TESTS.length; i++) {
      const startTimeTest = new Date();

      let { envsId, envs, log } = Environment({ envsId: envsIdGlob });
      envsIdGlob = envsId;
      envsGlob = envs;

      console.log(`TEST '${args.PPD_TESTS[i]}' start on '${dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')}'`);

      const testFile = args.PPD_TESTS[i];
      const testName = testFile.split('/')[testFile.split('/').length - 1];

      await envs.initOutput(args, testName);
      await envs.initOutputLatest(args);
      await envs.init();

      const { fullJSON, textDescription } = getFullDepthJSON({
        testName: testFile,
      });

      log({ level: 'env', text: '\n' + textDescription, testStruct: fullJSON, screenshot: false });

      const blocker = new Blocker();
      blocker.refresh();
      let test = getTest(fullJSON, envsId);

      console.log(`Prepate time 🕝: ${(new Date() - startTimeTest) / 1000} sec.`);

      await test();
      console.log(`Test '${args.PPD_TESTS[i]}' time 🕝: ${(new Date() - startTimeTest) / 1000} sec.`);
    }

    await envsGlob.closeBrowsers();
    await envsGlob.closeProcesses();
    console.log(`Evaluated time 🕝: ${(new Date() - startTime) / 1000} sec.`);

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
