/* eslint-disable prefer-arrow-callback */
import { ArgumentsType, PluginDocumentation } from '../../global.d';
import { Plugin } from '../../Plugins';

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
  exampleTest: 'src/Plugins/argsRedefine/argsRedefine.yaml',
  exampleTestResult: 'src.tests.e2e/snapshots/argsRedefine.log',
  name,
  type: 'plugin',
  propogation: false,
};

export default { name, documentation, plugin };
