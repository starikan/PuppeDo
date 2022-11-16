import { PluginContinueOnError } from './continueOnError/continueOnError';
import { PluginSkipSublingIfResult } from './skipSublingIfResult/skipSublingIfResult';
import { PluginArgsRedefine } from './argsRedefine/argsRedefine';
import { PluginDescriptionError } from './descriptionError/descriptionError';

export type PliginsFields = Partial<PluginSkipSublingIfResult> &
  Partial<PluginArgsRedefine> &
  Partial<PluginDescriptionError> &
  Partial<PluginContinueOnError>;

export type { PluginContinueOnError };
export type { PluginSkipSublingIfResult };
export type { PluginDescriptionError };
export type { PluginArgsRedefine };
