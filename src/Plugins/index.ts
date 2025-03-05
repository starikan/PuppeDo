import continueOnError, { PluginContinueOnError } from './continueOnError/continueOnError';
import skipSublingIfResult, { PluginSkipSublingIfResult } from './skipSublingIfResult/skipSublingIfResult';
import argsRedefine, { PluginArgsRedefine } from './argsRedefine/argsRedefine';
import descriptionError, { PluginDescriptionError } from './descriptionError/descriptionError';
import engineSupports, { PluginEngineSupports } from './engineSupports/engineSupports';
import debug, { PluginDebug } from './debug/debug';
import frame, { PluginFrame } from './frame/frame';

export type PliginsFields = Partial<PluginSkipSublingIfResult> &
  Partial<PluginDebug> &
  Partial<PluginArgsRedefine> &
  Partial<PluginDescriptionError> &
  Partial<PluginEngineSupports> &
  Partial<PluginFrame> &
  Partial<PluginContinueOnError>;

export type { PluginContinueOnError };
export type { PluginDebug };
export type { PluginSkipSublingIfResult };
export type { PluginDescriptionError };
export type { PluginEngineSupports };
export type { PluginArgsRedefine };
export type { PluginFrame };

export default {
  continueOnError,
  debug,
  skipSublingIfResult,
  argsRedefine,
  descriptionError,
  engineSupports,
  frame,
};
