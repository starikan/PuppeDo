import { Arguments } from '../../Arguments';
import type { ArgumentsType, PluginDocumentation, PluginFunction, PluginModule } from '../../model';
import { Plugin } from '../../PluginsCore';

function setValue(
  this: Plugin<PluginArgsRedefine>,
  { inputs, stepId }: { inputs: Record<string, unknown>; stepId: string },
): void {
  this.setValues(stepId, inputs);
}

const plugin: PluginFunction<PluginArgsRedefine> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { argsRedefine: new Arguments().args },
    propogation: { argsRedefine: { type: 'lastParent' } },
    hooks: {
      initValues: setValue,
      runLogic: setValue,
    },
    plugins,
  });
  return pluginInstance;
};

export type PluginArgsRedefine = { argsRedefine: Partial<ArgumentsType> };

// todo: переименовать в args
const name = 'argsRedefine';

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
