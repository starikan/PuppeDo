import { PluginDocumentation, PluginFunction, PluginModule } from '../../global.d';
import { Plugin } from '../../PluginsCore';
import { runScriptInContext } from '../../Test';

export type PluginSkipSublingIfResult = { skipSublingIfResult: string; skipMeBecausePrevSublingResults: boolean };

const name = 'skipSublingIfResult';

const plugin: PluginFunction<PluginSkipSublingIfResult> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { skipSublingIfResult: '', skipMeBecausePrevSublingResults: false },
    propogation: { skipMeBecausePrevSublingResults: 'lastSubling' },
    hooks: {
      afterRepeat({ allData, results, stepId }): void {
        const { skipSublingIfResult, skipMeBecausePrevSublingResults } = pluginInstance.getValues(stepId);

        const skipMeBecausePrevSublingResultsResolved = skipSublingIfResult
          ? runScriptInContext(skipSublingIfResult, { ...allData, ...results })
          : skipMeBecausePrevSublingResults;

        pluginInstance.setValues(stepId, {
          skipSublingIfResult,
          skipMeBecausePrevSublingResults: Boolean(skipMeBecausePrevSublingResultsResolved),
        });
      },
    },
    plugins,
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
