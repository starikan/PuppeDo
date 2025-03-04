import { Plugin } from '../../PluginsCore';
import { PluginArgsRedefine } from '../argsRedefine/argsRedefine';

import { PluginDocumentation, PluginFunction, PluginModule } from '../../global.d';

export type PluginContinueOnError = { continueOnError: boolean };

const name = 'continueOnError';

const plugin: PluginFunction<PluginContinueOnError> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { continueOnError: false },
    propogation: { continueOnError: 'lastParent' },
    hooks: {
      initValues({ inputs, stepId }): void {
        const { PPD_CONTINUE_ON_ERROR_ENABLED } = plugins
          .getPlugins<PluginArgsRedefine>('argsRedefine')
          .getValue(stepId, 'argsRedefine');

        pluginInstance.setValues(stepId, {
          continueOnError: PPD_CONTINUE_ON_ERROR_ENABLED ? ((inputs.continueOnError as boolean) ?? false) : false,
        });
      },

      resolveValues: ({ inputs, stepId }): void => {
        const { PPD_CONTINUE_ON_ERROR_ENABLED } = plugins
          .getPlugins<PluginArgsRedefine>('argsRedefine')
          .getValue(stepId, 'argsRedefine');

        pluginInstance.setValues(stepId, {
          continueOnError: PPD_CONTINUE_ON_ERROR_ENABLED ? ((inputs.continueOnError as boolean) ?? false) : false,
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
