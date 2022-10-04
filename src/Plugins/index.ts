import { PluginsFabric } from '../PluginsCore';

import continueOnError, { PluginContinueOnError } from './continueOnError/continueOnError';
import skipSublingIfResult, { PluginSkipSublingIfResult } from './skipSublingIfResult/skipSublingIfResult';
import argsRedefine, { PluginArgsRedefine } from './argsRedefine/argsRedefine';
import descriptionError, { PluginDescriptionError } from './descriptionError/descriptionError';

const plugins = [skipSublingIfResult, continueOnError, descriptionError, argsRedefine];

const pluginsBusket = new PluginsFabric();

for (const plugin of plugins) {
  pluginsBusket.addPlugin(plugin.name, plugin.plugin);
}

export const documentations = plugins.map((v) => v.documentation);

export type PliginsFields = Partial<PluginSkipSublingIfResult> &
  Partial<PluginArgsRedefine> &
  Partial<PluginDescriptionError> &
  Partial<PluginContinueOnError>;

export { PluginContinueOnError, PluginSkipSublingIfResult, PluginDescriptionError, PluginArgsRedefine };
