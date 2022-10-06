/* eslint-disable prefer-arrow-callback */
import { ArgumentsType, PluginDocumentation } from '../../global.d';
import { Plugin } from '../../PluginsCore';

export type PluginArgsRedefine = { argsRedefine: Partial<ArgumentsType> };

const name = 'argsRedefine';

function plugin(): Plugin<PluginArgsRedefine> {
  return new Plugin<PluginArgsRedefine>({
    name,
    defaultValues: { argsRedefine: {} },
  });
}

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

export default { name, documentation, plugin };
