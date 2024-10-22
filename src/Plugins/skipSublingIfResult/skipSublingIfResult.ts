import { PluginDocumentation } from '../../global.d';
import { Plugin, PluginFunction, PluginModule } from '../../PluginsCore';

export type PluginSkipSublingIfResult = { skipSublingIfResult: string };

const name = 'skipSublingIfResult';

const plugin: PluginFunction<PluginSkipSublingIfResult> = () => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { skipSublingIfResult: '' },
  });
  return pluginInstance;
};

const documentation: PluginDocumentation = {
  description: {
    ru: [
      'Валидное JS выражение. Которое переводится в контексте конкретного блока в Boolean.',
      'На основании этого результата принимается решение:',
      '1. Если результат === true, то все последующие блоки на этом уровне пропускаются.',
      '2. Если false, то все последующие блоки игнорируют эту инструкцию.',
    ],
    en: ['TODO'],
  },
  examples: [
    {
      test: 'src/Plugins/skipSublingIfResult/skipSublingIfResult.yaml',
      result: 'src.tests.e2e/snapshots/skipSublingIfResult.log',
    },
  ],
  name,
  type: 'plugin',
  propogation: false,
};

const order = 400;

export default { name, documentation, plugin, order } as PluginModule<PluginSkipSublingIfResult>;
