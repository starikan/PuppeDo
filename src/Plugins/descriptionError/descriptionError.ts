/* eslint-disable prefer-arrow-callback */
import { PluginDocumentation } from '../../global.d';
import { Plugin } from '../../PluginsCore';
import { runScriptInContext } from '../../Test';

export type PluginDescriptionError = { descriptionError: string };

const name = 'descriptionError';

function plugin(): Plugin<PluginDescriptionError> {
  const pluginInstance = new Plugin<PluginDescriptionError>({
    name,
    defaultValues: { descriptionError: '' },
    hooks: {
      initValues: (initValues): void => {
        pluginInstance.defaultValues.descriptionError = initValues.descriptionError ?? '';
      },

      runLogic: (inputs): void => {
        const values: PluginDescriptionError = {
          descriptionError: inputs.descriptionError || pluginInstance.getValue('descriptionError'),
        };
        pluginInstance.setValues(values);
      },

      beforeFunctions: ({ args }): void => {
        let newValue;
        try {
          newValue = runScriptInContext(
            pluginInstance.defaultValues.descriptionError,
            args.allData,
            pluginInstance.defaultValues.descriptionError,
          );
        } catch (error) {
          // Nothng t do
        }
        if (newValue) {
          const values: PluginDescriptionError = { descriptionError: newValue };
          pluginInstance.setValues(values);
        }
      },

      afterResults: ({ results }): void => {
        let newValue;
        try {
          newValue = runScriptInContext(
            pluginInstance.defaultValues.descriptionError,
            results,
            pluginInstance.defaultValues.descriptionError,
          );
        } catch (error) {
          // Nothng t do
        }
        if (newValue) {
          const values: PluginDescriptionError = { descriptionError: newValue };
          pluginInstance.setValues(values);
        }
      },
    },
  });

  return pluginInstance;
}

const documentation: PluginDocumentation = {
  description: {
    ru: [
      'При падении тестов в логи выводится информация из этого поля',
      'Поле является исполняемым в контексте данных',
    ],
    en: ['TODO'],
  },
  examples: [
    {
      test: 'src/Plugins/descriptionError/descriptionError.yaml',
      result: 'src.tests.e2e/snapshots/descriptionError.log',
    },
    {
      test: 'src/Plugins/descriptionError/descriptionErrorNested.yaml',
      result: 'src.tests.e2e/snapshots/descriptionErrorNested.log',
    },
  ],
  name,
  type: 'plugin',
  propogation: false,
};

export default { name, documentation, plugin };
