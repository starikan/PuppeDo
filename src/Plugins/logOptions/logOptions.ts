import { Plugin } from '../../PluginsCore';
import { ColorsType, LogOptionsType, PluginDocumentation, PluginFunction, PluginModule } from '../../global';
import { PluginArgsRedefine } from '../argsRedefine/argsRedefine';

function setValue(
  this: Plugin<PluginLogOptions>,
  { inputs, stepId }: { inputs: Record<string, unknown>; stepId: string },
): void {
  this.setValues(stepId, inputs);

  const { logOptions } = this.getValues(stepId);
  const { logOptions: logOptionsParent } = this.getValuesParent(stepId);
  const { PPD_LOG_IGNORE_HIDE_LOG } = this.plugins
    .getPlugins<PluginArgsRedefine>('argsRedefine')
    .getValue(stepId, 'argsRedefine');

  const logShowFlag = (PPD_LOG_IGNORE_HIDE_LOG || logOptions.logThis) ?? logOptionsParent.logChildren ?? true;

  this.setValues(stepId, {
    logOptions: {
      logThis: PPD_LOG_IGNORE_HIDE_LOG ? true : (logOptionsParent.logChildren ?? true),
      ...logOptions,
      logShowFlag,
    },
  });
}

const plugin: PluginFunction<PluginLogOptions> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: {
      logOptions: {
        textColor: 'sane' as ColorsType,
        backgroundColor: 'sane' as ColorsType,
        logChildren: true,
        logShowFlag: true,
      },
    },
    hooks: {
      initValues: setValue,
      runLogic: setValue,
      resolveValues: setValue,
    },
    propogation: { logOptions: { type: 'lastParent', fieldsOnly: ['logChildren'], force: true } },
    plugins,
  });
  return pluginInstance;
};

export type PluginLogOptions = { logOptions: LogOptionsType };

const name = 'logOptions';

const documentation: PluginDocumentation = {
  description: {
    ru: ['Управление настройками логирования для отдельных агентов.'],
    en: ['Control logging options for individual agents.'],
  },
  examples: [
    {
      test: 'src/Plugins/logOptions/logOptions.yaml',
      result: 'src.tests.e2e/snapshots/logOptions.log',
    },
  ],
  name,
  type: 'plugin',
  propogation: true,
};

const order = 700;

const depends = [];

const pluginModule: PluginModule<PluginLogOptions> = { name, documentation, plugin, order, depends };

export default pluginModule;
