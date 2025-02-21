const path = require('path');

module.exports = {
  args: {
    PPD_ROOT: 'tests',
    PPD_ROOT_ADDITIONAL: [path.join(__dirname, './src/Plugins')],
    PPD_FILES_IGNORE: 'tests\\broken.yaml',
    PPD_LIFE_CYCLE_FUNCTIONS: ['beforeRun', 'beforeTest', 'run', 'runTest', 'afterRun', 'afterTest'],
    // PPD_LOG_STEPID: true,
  },
};
