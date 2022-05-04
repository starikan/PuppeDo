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
  description: ['Переопределение агрументов ENV для конкретного кейса.', 'Все аргументы описаны в ArgumentsType'],
  example: '',
  exampleTest: './argsRedefine.yaml',
  name,
  type: 'plugin',
  propogation: false,
};

export default { name, documentation, plugin };
