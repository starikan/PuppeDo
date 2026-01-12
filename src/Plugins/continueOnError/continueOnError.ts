import type { PluginDocumentation, PluginFunction, PluginModule } from '../../model';
import { Plugin } from '../../PluginsCore';
import type { PluginArgsRedefine } from '../argsRedefine/argsRedefine';

function setValue(
  this: Plugin<PluginContinueOnError>,
  { inputs, stepId }: { inputs: Record<string, unknown>; stepId: string },
): void {
  const { PPD_CONTINUE_ON_ERROR_ENABLED } = this.plugins
    .getPlugins<PluginArgsRedefine>('argsRedefine')
    .getValue(stepId, 'argsRedefine');

  this.setValues(stepId, {
    continueOnError: PPD_CONTINUE_ON_ERROR_ENABLED && ((inputs.continueOnError as boolean) || false),
  });
}

const plugin: PluginFunction<PluginContinueOnError> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { continueOnError: false },
    propogation: { continueOnError: { type: 'lastParent' } },
    hooks: {
      initValues: setValue,
      resolveValues: setValue,
    },
    plugins,
  });

  return pluginInstance;
};

export type PluginContinueOnError = { continueOnError: boolean };

const name = 'continueOnError';

const documentation: PluginDocumentation = {
  description: {
    ru: [
      'Булевое значение. Отвечает за поведение блока при ошибке.',
      'Управление происходит с помощью глобальной переменной [PPD_CONTINUE_ON_ERROR_ENABLED](#PPD_CONTINUE_ON_ERROR_ENABLED) уоторая включает и выключает данную функцию.',
      'При [PPD_CONTINUE_ON_ERROR_ENABLED](#PPD_CONTINUE_ON_ERROR_ENABLED) === false "continueOnError" игнорируется.',
      'Если continueOnError === true, то при ошибке в блоке он пропустится и пойдет следующий',
      'Если continueOnError === false, то при ошибке в блоке он выдаст ошибку',
    ],
    en: ['TODO'],
  },
  examples: [
    {
      test: 'src/Plugins/continueOnError/continueOnError.yaml',
      result: 'src.tests.e2e/snapshots/continueOnError.log',
    },
  ],
  name,
  type: 'plugin',
  propogation: false,
};

const order = 200;

const depends = ['argsRedefine'];

const pluginModule: PluginModule<PluginContinueOnError> = { name, documentation, plugin, order, depends };

export default pluginModule;
