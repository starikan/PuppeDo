/* eslint-disable prefer-arrow-callback */
import { PluginDocumentation } from '../../global.d';
import { Plugin } from '../../Plugins';

export type PluginSkipSublingIfResult = { skipSublingIfResult: string };

const name = 'skipSublingIfResult';

function plugin(): Plugin<PluginSkipSublingIfResult> {
  return new Plugin<PluginSkipSublingIfResult>({
    name,
    defaultValues: { skipSublingIfResult: '' },
  });
}

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
  example: '',
  exampleTest: './skipSublingIfResult.yaml',
  name,
  type: 'plugin',
  propogation: false,
};

export default { name, documentation, plugin };