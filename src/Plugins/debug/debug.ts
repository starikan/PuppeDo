import { PluginDocumentation, PluginFunction, PluginModule } from '../../global';
import { Plugin } from '../../PluginsCore';
import { PluginArgsRedefine } from '../argsRedefine/argsRedefine';

export type PluginDebug = { debug: boolean };

const name = 'debug';

const plugin: PluginFunction<PluginDebug> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { debug: false },
    propogation: { debug: 'lastParent' },
    plugins,
    hooks: {
      initValues({ inputs, stepId }): void {
        const { PPD_DEBUG_MODE } = plugins
          .getPlugins<PluginArgsRedefine>('argsRedefine')
          .getValue(stepId, 'argsRedefine');

        pluginInstance.setValues(stepId, {
          debug: PPD_DEBUG_MODE ? ((inputs.debug as boolean) ?? false) : false,
        });
      },
      runLogic: ({ inputs, stepId }): void => {
        const { PPD_DEBUG_MODE } = plugins
          .getPlugins<PluginArgsRedefine>('argsRedefine')
          .getValue(stepId, 'argsRedefine');

        pluginInstance.setValues(stepId, {
          debug: PPD_DEBUG_MODE ? ((inputs.debug as boolean) ?? false) : false,
        });
      },
    },
  });
  return pluginInstance;
};

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
