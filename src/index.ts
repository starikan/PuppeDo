import run from './Api';
import { errorHandler } from './Error';
import TestStructure from './TestStructure';
import getTest from './getTest';
import TestsContent from './TestContent';
import { Arguments } from './Arguments';
import { argsDefault } from './Defaults';
import Blocker from './Blocker';
import { Environment } from './Environment';
import Log from './Log';
import Singleton from './Singleton';
import { paintString, blankSocket } from './Helpers';
import { runScriptInContext } from './Test';
import Screenshot from './Screenshot';
import { Plugin, Plugins } from './PluginsCore';

export default {
  run,
  errorHandler,
  TestStructure,
  getTest,
  TestsContent,
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
