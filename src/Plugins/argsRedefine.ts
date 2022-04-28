/* eslint-disable prefer-arrow-callback */
import { ArgumentsType } from '../global.d';
import { Plugin, PluginsFabric } from '../Plugins';

export type PluginArgsRedefine = { argsRedefine: Partial<ArgumentsType> };

const plugins = new PluginsFabric();

plugins.addPlugin('argsRedefine', function argsRedefine() {
  return new Plugin<PluginArgsRedefine>({
    name: 'argsRedefine',
    defaultValues: { argsRedefine: {} },
  });
});
