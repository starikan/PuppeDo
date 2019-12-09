module.exports = {
  runTest: async function(args) {
    const { data, log, levelIndent, _ } = args;

    const csvData = _.get(data, 'data');
    const headers = _.get(data, 'headers');
    const filename = _.get(data, 'filename');
    const folder = _.get(data, 'folder');

    const csvText = csvData.map(v => v.join(',')).join('\n');
    const fs = require('fs');
    const path = require('path');

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    fs.writeFileSync(path.join(folder, filename), headers + '\n' + csvText);

    await log({
      text: `Записан CSV файл: ${filename}`,
      screenshot: false,
      level: 'raw',
      levelIndent: levelIndent + 1,
    });
  },
};
