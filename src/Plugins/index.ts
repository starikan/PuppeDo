import { PluginList } from '../model';
import continueOnError, { PluginContinueOnError } from './continueOnError/continueOnError';
import skipSublingIfResult, { PluginSkipSublingIfResult } from './skipSublingIfResult/skipSublingIfResult';
import argsRedefine, { PluginArgsRedefine } from './argsRedefine/argsRedefine';
import descriptionError, { PluginDescriptionError } from './descriptionError/descriptionError';
import engineSupports, { PluginEngineSupports } from './engineSupports/engineSupports';
import debug, { PluginDebug } from './debug/debug';
import frame, { PluginFrame } from './frame/frame';
import logOptions, { PluginLogOptions } from './logOptions/logOptions';

export type PliginsFields = Partial<PluginSkipSublingIfResult> &
  Partial<PluginDebug> &
  Partial<PluginArgsRedefine> &
  Partial<PluginDescriptionError> &
  Partial<PluginEngineSupports> &
  Partial<PluginFrame> &
  Partial<PluginLogOptions> &
  Partial<PluginContinueOnError>;

export type { PluginContinueOnError };
export type { PluginDebug };
export type { PluginSkipSublingIfResult };
export type { PluginDescriptionError };
export type { PluginEngineSupports };
export type { PluginArgsRedefine };
export type { PluginFrame };
export type { PluginLogOptions };

export default {
  continueOnError,
  debug,
  skipSublingIfResult,
  argsRedefine,
  descriptionError,
  engineSupports,
  frame,
  logOptions,
};

export const pluginsListDefault: PluginList = {
  argsRedefine: { plugin: 'argsRedefine', order: 100 },
  logOptions: { plugin: 'logOptions', order: 150 },
  descriptionError: { plugin: 'descriptionError', order: 200 },
  continueOnError: { plugin: 'continueOnError', order: 300 },
  skipSublingIfResult: { plugin: 'skipSublingIfResult', order: 400 },
  engineSupports: { plugin: 'engineSupports', order: 500 },
  frame: { plugin: 'frame', order: 600 },
  debug: { plugin: 'debug' },
};
