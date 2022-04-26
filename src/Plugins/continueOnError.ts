/* eslint-disable prefer-arrow-callback */
import { Arguments } from '../Arguments';
import { ArgumentsType, TestExtendType } from '../global.d';
import { Plugin, Plugins, PluginsFabric } from '../Plugins';

export type PluginContinueOnError = { continueOnError: boolean };
export type PluginSkipSublingIfResult = { skipSublingIfResult: string };
export type PluginArgsRedefine = { argsRedefine: Partial<ArgumentsType> };

const plugins = new PluginsFabric();

plugins.addPlugin('continueOnError', function continueOnError() {
  const allPlugins = this as Plugins;
  return new Plugin<PluginContinueOnError>({
    name: 'continueOnError',
    defaultValues: { continueOnError: false },
    propogationsAndShares: {
      fromPrevSublingSimple: ['continueOnError'],
    },
    hooks: {
      resolveValues: function resolveValues(inputs: TestExtendType & PluginContinueOnError): void {
        const self = this as Plugin<PluginContinueOnError>;

        const { PPD_CONTINUE_ON_ERROR_ENABLED } = {
          ...new Arguments().args,
          ...allPlugins.getValue<PluginArgsRedefine>('argsRedefine').argsRedefine,
        };

        self.values.continueOnError = PPD_CONTINUE_ON_ERROR_ENABLED
          ? inputs.continueOnError || self.values.continueOnError
          : false;
      },
    },
  });
});

plugins.addPlugin('skipSublingIfResult', function skipSublingIfResult() {
  return new Plugin<PluginSkipSublingIfResult>({
    name: 'skipSublingIfResult',
    defaultValues: { skipSublingIfResult: '' },
  });
});

plugins.addPlugin('argsRedefine', function argsRedefine() {
  return new Plugin<PluginArgsRedefine>({
    name: 'argsRedefine',
    defaultValues: { argsRedefine: {} },
  });
});
