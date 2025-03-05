import { Plugin } from '../../PluginsCore';
import { PluginDocumentation, PluginFunction, PluginModule } from '../../global';

function setValue(
  this: Plugin<PluginFrame>,
  { inputs, stepId }: { inputs: Record<string, unknown>; stepId: string },
): void {
  this.setValues(stepId, { frame: inputs.frame as string });
}

const plugin: PluginFunction<PluginFrame> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { frame: '' },
    propogation: { frame: 'lastParent' },
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
