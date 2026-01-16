require('source-map-support').install();

const {
  run,
  errorHandler,
  FlowStructure,
  getTest,
  AgentContent,
  Environment,
  Arguments,
  Blocker,
  Log,
  Singleton,
  paintString,
  blankSocket,
  argsDefault,
  runScriptInContext,
  Screenshot,
  Plugin,
  Plugins,
} = require('./dist/index').default;

process.on('unhandledRejection', errorHandler);
process.on('SyntaxError', errorHandler);

if (!module.parent) {
  if (process.argv.length <= 2) {
    console.log('PuppeDo - Any workflows runner');
    console.log('');
    console.log('Usage: puppedo <special workflow files>');
    console.log('');
    console.log('Environment variables:');
    console.log('  PPD_TESTS          - Test files to run');
    console.log('  PPD_ROOT           - Root directory for tests');
    console.log('  PPD_BROWSER        - Browser to use (chrome, firefox)');
    console.log('');
    console.log('Examples:');
    console.log('  puppedo tests/*.yaml');
    console.log('  PPD_TESTS=tests/login.yaml puppedo');
    process.exit(0);
  }
  run();
} else {
  module.exports = {
    run,
    errorHandler,
    FlowStructure,
    getTest,
    AgentContent,
    Environment,
    Arguments,
    Blocker,
    Log,
    Singleton,
    paintString,
    blankSocket,
    argsDefault,
    runScriptInContext,
    Screenshot,
    Plugin,
    Plugins,
  };
}
