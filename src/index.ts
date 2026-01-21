import run from './Api';
import { Arguments } from './Arguments';
import Atom from './AtomCore';
import Blocker from './Blocker';
import { argsDefault } from './Defaults';
import { Environment } from './Environment';
import { errorHandler } from './Error';
import FlowStructure from './FlowStructure';
import getAgent from './getAgent';
import { blankSocket, paintString, runScriptInContext } from './Helpers';
import { Log } from './Log';
import { Plugin, Plugins } from './PluginsCore';
import Screenshot from './Screenshot';
import Singleton from './Singleton';
import AgentContent from './TestContent';

export default {
  run,
  errorHandler,
  FlowStructure,
  getAgent,

  /**
   * @deprecated
   */
  getTest: getAgent,
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
  Atom,
};
