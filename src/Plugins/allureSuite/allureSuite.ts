import { Environment } from '../../Environment';
import { PluginDocumentation } from '../../global.d';
import { Plugin, PluginFunction, PluginModule } from '../../PluginsCore';

export type PluginAllureSuit = { allureSuite: boolean };

const name = 'allureSuite';

const plugin: PluginFunction<PluginAllureSuit> = () => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { allureSuite: false },
    propogationsAndShares: {
      fromPrevSublingSimple: ['allureSuite'],
    },
    hooks: {
      initValues: ({ initValues }): void => {
        pluginInstance.defaultValues.allureSuite = initValues.allureSuite ?? false;
      },

      runLogic: ({ inputs }): void => {
        const values: PluginAllureSuit = {
          allureSuite: inputs.allureSuite || pluginInstance.getValue('allureSuite'),
        };
        pluginInstance.setValues(values);
      },

      resolveArgs: ({ args }): void => {
        const { envsId, stepId, name: nameTest, description } = args;
        const { testTree } = new Environment().getEnvInstance(envsId);
        testTree.updateStep({
          stepId,
          payload: { name: nameTest, description },
        });
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
