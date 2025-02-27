import { Arguments } from '../../Arguments';
import { ArgumentsType, PluginDocumentation } from '../../global.d';
import { Plugin, PluginFunction, PluginModule } from '../../PluginsCore';

export type PluginArgsRedefine = { argsRedefine: Partial<ArgumentsType> };

// todo: переименовать в args
const name = 'argsRedefine';

const plugin: PluginFunction<PluginArgsRedefine> = () => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { argsRedefine: {} },
    propogation: { argsRedefine: 'lastParent' },
    getValue(): ArgumentsType {
      return { ...new Arguments().args, ...this.values.argsRedefine };
    },
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

export default { name, documentation, plugin, order } as PluginModule<PluginArgsRedefine>;
