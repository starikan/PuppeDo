import { PluginsFabric } from '../Plugins';

import skipSublingIfResult from './skipSublingIfResult/skipSublingIfResult';
import continueOnError from './continueOnError/continueOnError';
import './argsRedefine';

const plugins = [skipSublingIfResult, continueOnError];

const pluginsBusket = new PluginsFabric();

for (const plugin of plugins) {
  pluginsBusket.addPlugin(plugin.name, plugin.plugin);
}
