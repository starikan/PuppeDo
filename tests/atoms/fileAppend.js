module.exports = {
  runTest: async function(args) {
    const fs = require('fs');

    const { data, log, helper, levelIndent } = args;
    const fileName = helper.anyGet(data, 'fileName');
    const string = helper.anyGet(data, 'string');

    if (fileName && string) {
      fs.appendFileSync(fileName, string);
    }

    await log({
      text: `Записано в файл "${fileName}"`,
      screenshot: false,
      level: 'raw',
      levelIndent: levelIndent + 1,
    });
  },
};
