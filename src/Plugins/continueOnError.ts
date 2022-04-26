/* eslint-disable object-shorthand */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-new */
import { Arguments } from '../Arguments';
import { ArgumentsType, TestExtendType } from '../global.d';
import { Plugin, Plugins, PluginsFabric } from '../Plugins';

const name = 'continueOnError';

export type PluginContinueOnError = { continueOnError: boolean };

const plugins = new PluginsFabric();
plugins.addPlugin(
  name,
  (allPlugins: Plugins) =>
    new Plugin<PluginContinueOnError>({
      name,
      defaultValues: { continueOnError: false },
      propogationsAndShares: {
        fromPrevSublingSimple: ['continueOnError'],
      },
      hooks: {
        resolveValues: function resolveValues(inputs: TestExtendType & PluginContinueOnError): void {
          const self = this as Plugin<PluginContinueOnError>;

          const { PPD_CONTINUE_ON_ERROR_ENABLED } = {
            ...new Arguments().args,
            ...(self.allPlugins.getValue('', 'argsRedefine') as Partial<ArgumentsType>),
          };

          self.values.continueOnError = PPD_CONTINUE_ON_ERROR_ENABLED
            ? inputs.continueOnError || self.values.continueOnError
            : false;
        },
      },
      allPlugins,
    }),
);
