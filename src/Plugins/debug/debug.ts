import { PluginDocumentation, PluginFunction, PluginModule } from '../../global';
import { Plugin } from '../../PluginsCore';
import { PluginArgsRedefine } from '../argsRedefine/argsRedefine';

function setValue(
  this: Plugin<PluginDebug>,
  { inputs, stepId }: { inputs: Record<string, unknown>; stepId: string },
): void {
  const { PPD_DEBUG_MODE } = this.plugins
    .getPlugins<PluginArgsRedefine>('argsRedefine')
    .getValue(stepId, 'argsRedefine');
  this.setValues(stepId, { debug: PPD_DEBUG_MODE && ((inputs.debug as boolean) || false) });
}

const plugin: PluginFunction<PluginDebug> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { debug: false },
    propogation: { debug: 'lastParent' },
    plugins,
    hooks: {
      initValues: setValue,
      runLogic: setValue,
    },
  });
  return pluginInstance;
};

export type PluginDebug = { debug: boolean };

const name = 'debug';

const documentation: PluginDocumentation = {
  description: {
    ru: ['Дебаггер для остановки агента в нужном месте'],
    en: ['Debugger for stopping the agent at the desired location'],
  },
  examples: [
    {
      test: 'src/Plugins/debug/debug.yaml',
      result: 'src.tests.e2e/snapshots/debug.log',
    },
  ],
  name,
  type: 'plugin',
  propogation: false,
};

const depends = ['argsRedefine'];

const pluginModule: PluginModule<PluginDebug> = { name, documentation, plugin, depends };

export default pluginModule;
