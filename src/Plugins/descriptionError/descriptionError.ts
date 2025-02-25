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
      runLogic: ({ inputs }): void => {
        pluginInstance.setValues(inputs);
      },

      beforeFunctions: ({ args }): void => {
        try {
          const newValue = runScriptInContext(
            pluginInstance.getValue('descriptionError'),
            args.allData,
            pluginInstance.getValue('descriptionError'),
          );
          if (newValue) {
            pluginInstance.setValues({ descriptionError: String(newValue) });
          }
        } catch {
          // Nothng to do
        }
      },

      afterResults: ({ results }): void => {
        try {
          const newValue = runScriptInContext(
            pluginInstance.getValue('descriptionError'),
            results,
            pluginInstance.getValue('descriptionError'),
          );
          if (newValue) {
            pluginInstance.setValues({ descriptionError: String(newValue) });
          }
        } catch {
          // Nothng to do
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
