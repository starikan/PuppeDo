/* eslint-disable prefer-arrow-callback */
import { ArgumentsType } from '../../global.d';
import { Plugin } from '../../Plugins';

export type PluginArgsRedefine = { argsRedefine: Partial<ArgumentsType> };

const name = 'argsRedefine';

function plugin(): Plugin<PluginArgsRedefine> {
  return new Plugin<PluginArgsRedefine>({
    name: 'argsRedefine',
    defaultValues: { argsRedefine: {} },
  });
}

const documentation = {
  description: 'Переопределение агрументов ENV для конкретного кейса. Все аргументы описаны в ArgumentsType',
  example: '',
  exampleTest: '',
  name,
  type: 'plugin',
  propogation: false,
};

export default { name, documentation, plugin };
