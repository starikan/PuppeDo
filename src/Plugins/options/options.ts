import { Plugin } from '../../PluginsCore';
import { resolveAliases } from '../../Test';
import { PluginDocumentation, PluginFunction, PluginModule, TestExtendType } from '../../model';

function setValue(
  this: Plugin<PluginOptions>,
  { inputs, stepId }: { inputs: Record<string, unknown>; stepId: string },
): void {
  this.setValues(stepId, inputs);

  const { options } = this.getValues(stepId);
  const { options: optionsParent } = this.getValuesParent(stepId);

  const result: PluginOptions = {
    options: {
      ...options,
      ...resolveAliases<PluginOptions['options']>('options', inputs as TestExtendType),
      ...optionsParent,
    },
  };

  // Merge parent options with current options
  this.setValues(stepId, result);
}

const plugin: PluginFunction<PluginOptions> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { options: {} },
    propogation: { options: { type: 'lastParent' } },
    hooks: {
      initValues: setValue,
      runLogic: setValue,
      resolveValues: setValue,
    },
    plugins,
  });
  return pluginInstance;
};

export type PluginOptions = {
  options: Record<string, string | number>;
};

const name = 'options';

const documentation: PluginDocumentation = {
  description: {
    ru: [
      'Плагин для управления опциями агентов.',
      'Опции наследуются от родительского агента к дочерним.',
      'Дочерние агенты могут переопределять унаследованные опции.',
    ],
    en: [
      'Plugin for managing agent options.',
      'Options are inherited from parent agent to children.',
      'Child agents can override inherited options.',
    ],
  },
  examples: [
    {
      test: 'src/Plugins/options/options.yaml',
      result: 'src.tests.e2e/snapshots/options.log',
    },
  ],
  name,
  type: 'plugin',
  propogation: true,
};

const order = 150;

const depends = [];

const pluginModule: PluginModule<PluginOptions> = { name, documentation, plugin, order, depends };

export default pluginModule;
