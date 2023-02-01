import { PluginDocumentation } from '../../global.d';
import { Plugin, PluginFunction, PluginModule } from '../../PluginsCore';
import { runScriptInContext } from '../../Test';

export type PluginAllureSuit = { allureSuite: string };

const name = 'allureSuite';

const plugin: PluginFunction<PluginAllureSuit> = () => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { allureSuite: '' },
    propogationsAndShares: {
      fromPrevSublingSimple: ['allureSuite'],
    },
    hooks: {
      initValues: ({ initValues }): void => {
        pluginInstance.defaultValues.allureSuite = initValues.allureSuite ?? '';
      },

      runLogic: ({ inputs }): void => {
        const values: PluginAllureSuit = {
          allureSuite: inputs.allureSuite || pluginInstance.getValue('allureSuite'),
        };
        pluginInstance.setValues(values);
      },

      beforeFunctions: ({ args }): void => {
        let newValue;
        try {
          newValue = runScriptInContext(
            pluginInstance.defaultValues.allureSuite,
            args.allData,
            pluginInstance.defaultValues.allureSuite,
          );
        } catch (error) {
          // Nothng t do
        }
        if (newValue) {
          const values: PluginAllureSuit = { allureSuite: newValue };
          pluginInstance.setValues(values);
        }
      },

      afterResults: ({ results }): void => {
        let newValue;
        try {
          newValue = runScriptInContext(
            pluginInstance.defaultValues.allureSuite,
            results,
            pluginInstance.defaultValues.allureSuite,
          );
        } catch (error) {
          // Nothng t do
        }
        if (newValue) {
          const values: PluginAllureSuit = { allureSuite: newValue };
          pluginInstance.setValues(values);
        }
      },
    },
  });

  return pluginInstance;
};

const documentation: PluginDocumentation = {
  description: {
    ru: ['Плагин для генерации логов для Allure'],
    en: ['TODO'],
  },
  examples: [
    {
      test: 'src/Plugins/allureSuite/allureSuite.yaml',
      result: 'src.tests.e2e/snapshots/allureSuite.log',
    },
  ],
  name,
  type: 'plugin',
  propogation: false,
};

const order = 500;

export default { name, documentation, plugin, order } as PluginModule<PluginAllureSuit>;
