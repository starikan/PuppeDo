import { Plugin, PluginFunction, PluginModule } from '../../PluginsCore';
import { PluginArgsRedefine } from '../argsRedefine/argsRedefine';

import { PluginDocumentation } from '../../global.d';

export type PluginContinueOnError = { continueOnError: boolean };

const name = 'continueOnError';

const plugin: PluginFunction<PluginContinueOnError> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { continueOnError: false },
    propogationsAndShares: {
      fromPrevSublingSimple: ['continueOnError'],
    },
    hooks: {
      resolveValues: ({ inputs }): void => {
        const { PPD_CONTINUE_ON_ERROR_ENABLED } = plugins
          .get<PluginArgsRedefine>('argsRedefine')
          .getValue('argsRedefine');

        pluginInstance.setValues({
          continueOnError: PPD_CONTINUE_ON_ERROR_ENABLED
            ? ((inputs.continueOnError as boolean) ?? pluginInstance.values.continueOnError)
            : false,
        });
      },
    },
    plugins,
  });

  return pluginInstance;
};

const documentation: PluginDocumentation = {
  description: {
    ru: [
      'Булевое значение. Отвечает за поведение блока при ошибке.',
      'Управление происходит с помощью глобальной переменной [PPD_CONTINUE_ON_ERROR_ENABLED](#PPD_CONTINUE_ON_ERROR_ENABLED) уоторая включает и выключает данную функцию.',
      'При [PPD_CONTINUE_ON_ERROR_ENABLED](#PPD_CONTINUE_ON_ERROR_ENABLED) === false "continueOnError" игнорируется.',
      'Если continueOnError === true, то при ошибке в блоке он пропустится и пойдет следующий',
      'Если continueOnError === false, то при ошибке в блоке он выдаст ошибку',
    ],
    en: ['TODO'],
  },
  examples: [
    {
      test: 'src/Plugins/continueOnError/continueOnError.yaml',
      result: 'src.tests.e2e/snapshots/continueOnError.log',
    },
  ],
  name,
  type: 'plugin',
  propogation: false,
};

const order = 200;

export default { name, documentation, plugin, order } as PluginModule<PluginContinueOnError>;
