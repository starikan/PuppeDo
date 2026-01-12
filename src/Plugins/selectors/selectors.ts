import { resolveAliases } from '../../Helpers';
import { PluginDocumentation, PluginFunction, PluginModule, TestExtendType } from '../../model';
import { Plugin } from '../../PluginsCore';

function setValue(
  this: Plugin<PluginSelectors>,
  { inputs, stepId }: { inputs: Record<string, unknown>; stepId: string },
): void {
  this.setValues(stepId, inputs);

  const { selectors } = this.getValues(stepId);
  const { selectors: selectorsParent } = this.getValuesParent(stepId);

  const result: PluginSelectors = {
    selectors: {
      ...selectors,
      ...resolveAliases<PluginSelectors['selectors']>('selectors', inputs as TestExtendType),
      ...selectorsParent,
    },
  };

  // Merge parent selectors with current selectors
  this.setValues(stepId, result);
}

const plugin: PluginFunction<PluginSelectors> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { selectors: {} },
    propogation: { selectors: { type: 'lastParent' } },
    hooks: {
      initValues: setValue,
      runLogic: setValue,
      beforeFunctions({ inputs, stepId }): void {
        this.setValues(stepId, inputs);
      },
    },
    plugins,
  });
  return pluginInstance;
};

export type PluginSelectors = { selectors: Record<string, unknown> };

const name = 'selectors';

const documentation: PluginDocumentation = {
  description: {
    ru: [
      'Плагин для управления селекторами. Позволяет использовать селекторы из родительских блоков.',
      'Селекторы доступны в дочерних блоках и передаются вниз по дереву агентов.',
    ],
    en: [
      'Plugin for managing selectors. Allows using selectors from parent blocks.',
      'Selectors are available in child blocks and are passed down the agent tree.',
    ],
  },
  examples: [
    {
      test: 'src/Plugins/selectors/selectors.yaml',
      result: 'src.tests.e2e/snapshots/selectors.log',
    },
  ],
  name,
  type: 'plugin',
  propogation: true,
};

const order = 170;

const depends = [];

const pluginModule: PluginModule<PluginSelectors> = { name, documentation, plugin, order, depends };

export default pluginModule;
