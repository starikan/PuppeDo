import continueOnError, { PluginContinueOnError } from './continueOnError/continueOnError';
import skipSublingIfResult, { PluginSkipSublingIfResult } from './skipSublingIfResult/skipSublingIfResult';
import argsRedefine, { PluginArgsRedefine } from './argsRedefine/argsRedefine';
import descriptionError, { PluginDescriptionError } from './descriptionError/descriptionError';

export type PliginsFields = Partial<PluginSkipSublingIfResult> &
  Partial<PluginArgsRedefine> &
  Partial<PluginDescriptionError> &
  Partial<PluginContinueOnError>;

export type { PluginContinueOnError };
export type { PluginSkipSublingIfResult };
export type { PluginDescriptionError };
export type { PluginArgsRedefine };

export default {
  continueOnError,
  skipSublingIfResult,
  argsRedefine,
  descriptionError,
};
