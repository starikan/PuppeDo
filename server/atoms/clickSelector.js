module.exports = {
  runTest: async function (args) {
    const { page, selectors, log } = args;
    const sel = selectors.selector;

    await log({
      text: `Нажат селектор = ${sel}`,
      screenshot: true,
      fullpage: false,
      selCSS: [sel],
      level: 'debug'
    });
    // debugger;
    let element = await page.$(sel);
    await element.click(sel);
  }
};