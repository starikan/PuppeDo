/* eslint-disable prefer-arrow-callback */
import { PluginDocumentation } from '../../global.d';
import { Plugin, PluginFunction, PluginModule } from '../../PluginsCore';
import { runScriptInContext } from '../../Test';

export type PluginDescriptionError = { descriptionError: string };

const name = 'descriptionError';

const plugin: PluginFunction<PluginDescriptionError> = () => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { descriptionError: '' },
    hooks: {
      initValues: ({ initValues }): void => {
        pluginInstance.defaultValues.descriptionError = initValues.descriptionError ?? '';
      },

      runLogic: ({ inputs }): void => {
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
};

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
    {
      test: 'src/Plugins/descriptionError/descriptionErrorDynamic.yaml',
      result: 'src.tests.e2e/snapshots/descriptionErrorDynamic.log',
    },
  ],
  name,
  type: 'plugin',
  propogation: false,
};

const order = 300;

export default { name, documentation, plugin, order } as PluginModule<PluginDescriptionError>;
