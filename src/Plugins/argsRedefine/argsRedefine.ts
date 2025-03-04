import { Arguments } from '../../Arguments';
import { ArgumentsType, PluginDocumentation, PluginFunction, PluginModule } from '../../global.d';
import { Plugin } from '../../PluginsCore';

export type PluginArgsRedefine = { argsRedefine: Partial<ArgumentsType> };

// todo: переименовать в args
const name = 'argsRedefine';

const plugin: PluginFunction<PluginArgsRedefine> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { argsRedefine: new Arguments().args },
    propogation: { argsRedefine: 'lastParent' },
    hooks: {
      initValues: ({ inputs, stepId }): void => {
        pluginInstance.setValues(stepId, inputs);
      },
      runLogic: ({ inputs, stepId }): void => {
        pluginInstance.setValues(stepId, inputs);
      },
    },
    plugins,
  });
  return pluginInstance;
};

const documentation: PluginDocumentation = {
  description: {
    ru: ['Переопределение агрументов ENV для конкретного кейса.', 'Все аргументы описаны в ArgumentsType'],
    en: ['TODO'],
  },
  examples: [
    {
      test: 'src/Plugins/argsRedefine/argsRedefine.yaml',
      result: 'src.tests.e2e/snapshots/argsRedefine.log',
    },
  ],
  name,
  type: 'plugin',
  propogation: false,
};

const order = 100;

const depends = [];

const pluginModule: PluginModule<PluginArgsRedefine> = { name, documentation, plugin, order, depends };

export default pluginModule;
