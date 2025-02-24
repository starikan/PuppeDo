import { BrowserEngineType, PluginDocumentation } from '../../global.d';
import { Plugin, PluginFunction, PluginModule } from '../../PluginsCore';

export type PluginEngineSupports = { engineSupports: BrowserEngineType[] };

const name = 'engineSupports';

const plugin: PluginFunction<PluginEngineSupports> = ({ originAgent }) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { engineSupports: [] },
    originAgent,
    hooks: {
      resolveValues(): void {
        if (originAgent.agent.engineSupports.length) {
          const { engine } = originAgent.runner?.getRunnerData()?.browser || {};
          if (engine && !originAgent.agent.engineSupports.includes(engine)) {
            throw new Error(
              `Current engine: '${engine}' not supported with this agent. You need to use: ${originAgent.agent.engineSupports}`,
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
