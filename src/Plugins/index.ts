import { PluginContinueOnError } from './continueOnError/continueOnError';
import { PluginSkipSublingIfResult } from './skipSublingIfResult/skipSublingIfResult';
import { PluginArgsRedefine } from './argsRedefine/argsRedefine';
import { PluginDescriptionError } from './descriptionError/descriptionError';
import { PluginAllureSuit } from './logger-allure/allureSuite';

export type PliginsFields = Partial<PluginSkipSublingIfResult> &
  Partial<PluginArgsRedefine> &
  Partial<PluginDescriptionError> &
  Partial<PluginAllureSuit> &
  Partial<PluginContinueOnError>;

export type { PluginContinueOnError };
export type { PluginSkipSublingIfResult };
export type { PluginDescriptionError };
export type { PluginAllureSuit };
export type { PluginArgsRedefine };
