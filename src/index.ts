import run from './Api';
import { errorHandler } from './Error';
import getFullDepthJSON from './getFullDepthJSON';
import getTest from './getTest';
import TestsContent from './TestContent';
import Arguments from './Arguments';
import Blocker from './Blocker';
import Environment from './Environment';
import Log from './Log';

// process.on('unhandledRejection', errorHandler);
// process.on('SyntaxError', errorHandler);

// if (!module.parent) {
//   run();
// } else {
module.exports = {
  run,
  errorHandler,
  getFullDepthJSON,
  getTest,
  TestsContent,
  Environment,
  Arguments,
  Blocker,
  Log,
};
// }
