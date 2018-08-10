module.exports = {
  runTest: async function (args) {
    const { page, selectors, log } = args;
    await page.waitForSelector( selectors.sel, {
      visible: true
    } );
    await log({ text: `waitForSelector ${selectors.sel}` });
  }
};