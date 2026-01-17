import { resolveAliases } from '../../Helpers';
import type { PluginDocumentation, PluginFunction, PluginModule, TestExtendType } from '../../model';
import { Plugin } from '../../PluginsCore';

function setValue(
  this: Plugin<PluginOptions>,
  { inputs, stepId }: { inputs: Record<string, unknown>; stepId: string },
): void {
  this.setValues(stepId, inputs);

  const { options, allowOptions } = this.getValues(stepId);
  const { options: optionsParent } = this.getValuesParent(stepId);

  const result: PluginOptions = {
    options: {
      ...options,
      ...resolveAliases<PluginOptions['options']>('options', inputs as TestExtendType),
      ...optionsParent,
    },
    allowOptions,
  };

  // Merge parent options with current options
  this.setValues(stepId, result);
}

const plugin: PluginFunction<PluginOptions> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { options: {}, allowOptions: [] },
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
  allowOptions: string[];
};

const name = 'options';

const documentation: PluginDocumentation = {
  description: {
    ru: [
      'Плагин для управления опциями агентов.',
      'Опции наследуются от родительского агента к дочерним.',
      'Дочерние агенты могут переопределять унаследованные опции.',
      'Позволяет агентам указывать, какие опции разрешены для использования.',
      'Опции, указанные в allowOptions, могут быть использованы в дочерних агентах.',
    ],
    en: [
      'Plugin for managing agent options.',
      'Options are inherited from the parent agent to the child agents.',
      'Child agents can override inherited options.',
      'Allows agents to specify which options are permitted for use.',
      'Options specified in allowOptions can be used in child agents.',
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
export { setValue, plugin };
