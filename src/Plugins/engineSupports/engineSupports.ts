import { Environment } from '../../Environment';
import { BrowserEngineType, PluginDocumentation } from '../../global.d';
import { Plugin, PluginFunction, PluginModule } from '../../PluginsCore';

export type PluginEngineSupports = { engineSupports: BrowserEngineType[] };

const name = 'engineSupports';

const plugin: PluginFunction<PluginEngineSupports> = ({ envsId }) => {
  const pluginInstance = new Plugin<PluginEngineSupports>({
    name,
    defaultValues: { engineSupports: [] },
    hooks: {
      resolveValues: ({ inputs }): void => {
        const { allRunners } = new Environment().getEnvInstance(envsId);
        const current = new Environment().getCurrent(envsId);
        const runner = allRunners.getRunnerByName(current.name || '');

        const { engineSupports } = pluginInstance.setValues(inputs);
        if (engineSupports.length) {
          const { engine } = runner?.getRunnerData()?.browser || {};
          if (engine && !engineSupports.includes(engine)) {
            throw new Error(
              `Current engine: '${engine}' not supported with this agent. You need to use: ${engineSupports}`,
            );
          }
        }
      },
    },
  });
  return pluginInstance;
};

const documentation: PluginDocumentation = {
  description: {
    ru: ['Плагин для проверки поддержки браузерных движков, с помощью которых работают агенты'],
    en: ['Plugin for checking browser engine support, with which agents work'],
  },
  examples: [
    {
      test: 'src/Plugins/engineSupports/engineSupports.yaml',
      result: 'src.tests.e2e/snapshots/engineSupports.log',
    },
  ],
  name,
  type: 'plugin',
  propogation: false,
};

const order = 500;

export default { name, documentation, plugin, order } as PluginModule<PluginEngineSupports>;
