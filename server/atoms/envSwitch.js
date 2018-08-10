module.exports = {
  runTest: async function (args) {
    const { envs, data, log } = args;
    await log({
      text: `Переключение среды = ${data.envName}`,
      screenshot: false,
      fullpage: false,
      level: 'debug'
    });
    await envs.setEnv(data.envName);
  }
};