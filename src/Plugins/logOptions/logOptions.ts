import { Plugin } from '../../PluginsCore';
import { ColorsType, LogOptionsType, PluginDocumentation, PluginFunction, PluginModule } from '../../global';

function setValue(
  this: Plugin<PluginLogOptions>,
  { inputs, stepId }: { inputs: Record<string, unknown>; stepId: string },
): void {
  this.setValues(stepId, inputs);
}

const plugin: PluginFunction<PluginLogOptions> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: {
      logOptions: {
        textColor: 'sane' as ColorsType,
        backgroundColor: 'sane' as ColorsType,
        logChildren: true,
      },
    },
    hooks: {
      initValues: setValue,
      runLogic: setValue,
    },
    propogation: { logOptions: { type: 'lastParent', fieldsOnly: ['logChildren'], force: true } },
    plugins,
  });
  return pluginInstance;
};

export type PluginLogOptions = { logOptions: LogOptionsType };

const name = 'logOptions';

const documentation: PluginDocumentation = {
  description: {
    ru: ['Управление настройками логирования для отдельных агентов.'],
    en: ['Control logging options for individual agents.'],
  },
  examples: [
    {
      test: 'src/Plugins/logOptions/logOptions.yaml',
      result: 'src.tests.e2e/snapshots/logOptions.log',
    },
  ],
  name,
  type: 'plugin',
  propogation: true,
};

const order = 700;

const depends = [];

const pluginModule: PluginModule<PluginLogOptions> = { name, documentation, plugin, order, depends };

export default pluginModule;
