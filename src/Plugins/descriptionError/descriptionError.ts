import { runScriptInContext } from '../../Helpers';
import type { PluginDocumentation, PluginFunction, PluginModule } from '../../model';
import { Plugin } from '../../PluginsCore';

function setValue(
  this: Plugin<PluginDescriptionError>,
  { inputs, stepId }: { inputs: Record<string, unknown>; stepId: string },
): void {
  this.setValues(stepId, inputs);
}

const plugin: PluginFunction<PluginDescriptionError> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { descriptionError: '' },
    hooks: {
      initValues: setValue,
      runLogic: setValue,
      afterResults: ({ inputs, stepId }): void => {
        try {
          const newValue = runScriptInContext(
            pluginInstance.getValue(stepId, 'descriptionError'),
            inputs,
            pluginInstance.getValue(stepId, 'descriptionError'),
          );
          if (newValue) {
            pluginInstance.setValues(stepId, { descriptionError: String(newValue) });
          }
        } catch {
          // Nothng to do
        }
      },
    },
    plugins,
  });

  return pluginInstance;
};

export type PluginDescriptionError = { descriptionError: string };

const name = 'descriptionError';

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

const depends = [];

const pluginModule: PluginModule<PluginDescriptionError> = { name, documentation, plugin, order, depends };

export default pluginModule;
export { setValue, plugin };
