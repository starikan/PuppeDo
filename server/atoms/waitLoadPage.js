module.exports = {
  runTest: async function (args) {
    const _ = require('lodash');
    const { page, options, log } = args;

    await page.waitForNavigation({ waitUntil: _.get(options, 'waitUntil', 'load') });
    await log({ text: `waitLoadPage` });
  }
};