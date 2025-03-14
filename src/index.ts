import run from './Api';
import { errorHandler } from './Error';
import TestStructure from './TestStructure';
import getAgent from './getAgent';
import AgentContent from './TestContent';
import { Arguments } from './Arguments';
import { argsDefault } from './Defaults';
import Blocker from './Blocker';
import { Environment } from './Environment';
import { Log } from './Log';
import Singleton from './Singleton';
import { paintString, blankSocket, runScriptInContext } from './Helpers';
import Screenshot from './Screenshot';
import { Plugin, Plugins } from './PluginsCore';

export default {
  run,
  errorHandler,
  TestStructure,
  getAgent,

  /**
   * @deprecated
   */
  getTest: getAgent,
  AgentContent,

  /**
   * @deprecated
   */
  TestsContent: AgentContent,
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
