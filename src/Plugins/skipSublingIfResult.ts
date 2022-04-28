/* eslint-disable prefer-arrow-callback */
import { Plugin, PluginsFabric } from '../Plugins';

export type PluginSkipSublingIfResult = { skipSublingIfResult: string };

const plugins = new PluginsFabric();

const name = 'skipSublingIfResult';

plugins.addPlugin(name, function skipSublingIfResult() {
  return new Plugin<PluginSkipSublingIfResult>({
    name,
    defaultValues: { skipSublingIfResult: '' },
  });
});

const documentation = {
  description: `Валидное JS выражение. Которое переводится в контексте конкретного блока в Boolean.
  На основании этого результата принимается решение:
  1. Если результат === true, то все последующие блоки на этом уровне пропускаются.
  2. Если false, то все последующие блоки игнорируют эту инструкцию.`,
  example: '',
  exampleTest: '',
  name,
  type: 'plugin',
};

export { documentation };
