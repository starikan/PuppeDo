module.exports = {
  runTest: async function(args) {
    const { page, data, log, levelIndent } = args;
    await page.goto(data.url);
    await log({
      text: `Go to: ${data.url}`,
      level: 'info',
      screenshot: false,
      fullpage: false,
      levelIndent: levelIndent + 1,
    });
  },
};
