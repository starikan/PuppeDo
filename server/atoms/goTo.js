module.exports = {
  runTest: async function (args) {
    const { page, data, log } = args;
    await page.goto(data.url);
    await log({ text: `Go to: ${data.url}` });
  }
};