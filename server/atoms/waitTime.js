module.exports = {
  runTest: async function (args) {
    const { page, data, log } = args;
    await page.waitFor( data.time );
    await log({ text: `waitTime ${data.time}ms`, level: 'debug' });
  }
};