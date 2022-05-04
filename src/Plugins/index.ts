import { PluginsFabric } from '../Plugins';

import continueOnError, { PluginContinueOnError } from './continueOnError/continueOnError';
import skipSublingIfResult, { PluginSkipSublingIfResult } from './skipSublingIfResult/skipSublingIfResult';
import argsRedefine, { PluginArgsRedefine } from './argsRedefine/argsRedefine';

const plugins = [skipSublingIfResult, continueOnError, argsRedefine];

const pluginsBusket = new PluginsFabric();

for (const plugin of plugins) {
  pluginsBusket.addPlugin(plugin.name, plugin.plugin);
}

export type PliginsFields = Record<string, unknown> &
  Partial<PluginSkipSublingIfResult> &
  Partial<PluginArgsRedefine> &
  Partial<PluginContinueOnError>;

export { PluginContinueOnError, PluginSkipSublingIfResult, PluginArgsRedefine };
