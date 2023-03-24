import { PluginDocumentation } from '../../global.d';
import { Plugin, PluginFunction, PluginModule } from '../../PluginsCore';

export type PluginAllureSuit = { allureSuite: boolean };

export type PluginAllureSuitArgs = { PPD_ALLURE_TAG_ON: string[] };

const name = 'allureSuite';

const argumentsPlugin = {
  PPD_ALLURE_TAG_ON: [],
};

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
        const { envsId, stepId, name: nameTest, description, environment, argsTest } = args;
        const { testTree } = environment.getEnvInstance(envsId);
        testTree.updateStep({
          stepId,
          payload: { name: nameTest, description },
        });

        const { PPD_ALLURE_TAG_ON = argumentsPlugin.PPD_ALLURE_TAG_ON } = argsTest;
        if (PPD_ALLURE_TAG_ON.includes(nameTest)) {
          const values: PluginAllureSuit = {
            allureSuite: true,
          };
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

export default { name, documentation, plugin, order, argumentsPlugin } as PluginModule<PluginAllureSuit>;
