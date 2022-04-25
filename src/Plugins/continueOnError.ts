/* eslint-disable object-shorthand */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-new */
import { Arguments } from '../Arguments';
import { ArgumentsType, TestExtendType } from '../global.d';
import { Plugin, Plugins, PluginsFabric } from '../Plugins';

const name = 'continueOnError';

type Type_continueOnError = { continueOnError: boolean };

const plugins = new PluginsFabric();
plugins.addPlugin(
  name,
  (allPlugins: Plugins) =>
    new Plugin<Type_continueOnError>({
      name,
      defaultValues: { continueOnError: false },
      // propogationsAndShares: {
      //   prevSubling: ['continueOnError']
      // },
      hooks: {
        resolveValues: function resolveValues(inputs: TestExtendType & Type_continueOnError): void {
          const self = this as Plugin<Type_continueOnError>;

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
