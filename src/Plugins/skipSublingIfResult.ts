/* eslint-disable prefer-arrow-callback */
import { Plugin, PluginsFabric } from '../Plugins';

export type PluginSkipSublingIfResult = { skipSublingIfResult: string };

const plugins = new PluginsFabric();

plugins.addPlugin('skipSublingIfResult', function skipSublingIfResult() {
  return new Plugin<PluginSkipSublingIfResult>({
    name: 'skipSublingIfResult',
    defaultValues: { skipSublingIfResult: '' },
  });
});
