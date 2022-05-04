const path = require('path');

module.exports = {
  args: {
    PPD_ROOT: 'tests',
    PPD_ROOT_ADDITIONAL: [path.join(__dirname, './src/Plugins')],
    PPD_DEBUG_MODE: true,
    PPD_FILES_IGNORE: 'tests\\broken.yaml',
  },
};
