import type { PluginDocumentation, PluginFunction, PluginModule } from '../../model';
import { Plugin } from '../../PluginsCore';

function setValue(
  this: Plugin<PluginFrame>,
  { inputs, stepId }: { inputs: Record<string, unknown>; stepId: string },
): void {
  this.setValues(stepId, inputs);
}

const plugin: PluginFunction<PluginFrame> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { frame: '' },
    propogation: { frame: { type: 'lastParent' } },
    hooks: {
      initValues: setValue,
      runLogic: setValue,
    },
    plugins,
  });
  return pluginInstance;
};

export type PluginFrame = { frame: string };

const name = 'frame';

const documentation: PluginDocumentation = {
  description: {
    ru: ['Поддержка работы с фреймами. Позволяет указать целевой фрейм для выполнения действий.'],
    en: ['Frame support. Allows to specify target frame for actions.'],
  },
  examples: [
    {
      test: 'src/Plugins/frame/frame.yaml',
      result: 'src.tests.e2e/snapshots/frame.log',
    },
  ],
  name,
  type: 'plugin',
  propogation: true,
};

const order = 150;

const depends = [];

const pluginModule: PluginModule<PluginFrame> = { name, documentation, plugin, order, depends };

export default pluginModule;
export { setValue, plugin };
