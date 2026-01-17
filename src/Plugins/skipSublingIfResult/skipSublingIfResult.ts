import { runScriptInContext } from '../../Helpers';
import type { PluginDocumentation, PluginFunction, PluginModule } from '../../model';
import { Plugin } from '../../PluginsCore';

function setValue(
  this: Plugin<PluginSkipSublingIfResult>,
  { inputs, stepId }: { inputs: Record<string, unknown>; stepId: string },
): void {
  this.setValues(stepId, inputs);
}

const plugin: PluginFunction<PluginSkipSublingIfResult> = (plugins) => {
  const pluginInstance = new Plugin({
    name,
    defaultValues: { skipSublingIfResult: '', skipMeBecausePrevSublingResults: false },
    propogation: { skipMeBecausePrevSublingResults: { type: 'lastSubling' } },
    hooks: {
      initValues: setValue,
      runLogic: setValue,
      afterRepeat({ inputs, stepId }): void {
        const { skipSublingIfResult, skipMeBecausePrevSublingResults } = pluginInstance.getValues(stepId);

        try {
          const skipMeBecausePrevSublingResultsResolved = skipSublingIfResult
            ? runScriptInContext(skipSublingIfResult, inputs)
            : skipMeBecausePrevSublingResults;

          pluginInstance.setValues(stepId, {
            skipSublingIfResult,
            skipMeBecausePrevSublingResults: Boolean(skipMeBecausePrevSublingResultsResolved),
          });
        } catch {
          pluginInstance.setValues(stepId, {
            skipSublingIfResult,
            skipMeBecausePrevSublingResults: false,
          });
        }
      },
    },
    plugins,
  });
  return pluginInstance;
};

export type PluginSkipSublingIfResult = { skipSublingIfResult: string; skipMeBecausePrevSublingResults: boolean };

const name = 'skipSublingIfResult';

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

const depends = [];

const pluginModule: PluginModule<PluginSkipSublingIfResult> = { name, documentation, plugin, order, depends };

export default pluginModule;
export { setValue, plugin };
