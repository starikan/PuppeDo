module.exports = {
  runTest: async function(args) {
    const { envs, data, log, levelIndent } = args;
    await log({
      text: `Переключение среды = ${data.envName}`,
      screenshot: false,
      fullpage: false,
      level: 'debug',
      levelIndent: levelIndent + 1,
    });
    await envs.setEnv(data.envName);
  },
};
