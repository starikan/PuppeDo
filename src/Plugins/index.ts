import type { PluginList } from '../model';
import argsRedefine, { type PluginArgsRedefine } from './argsRedefine/argsRedefine';
import continueOnError, { type PluginContinueOnError } from './continueOnError/continueOnError';
import debug, { type PluginDebug } from './debug/debug';
import descriptionError, { type PluginDescriptionError } from './descriptionError/descriptionError';
import engineSupports, { type PluginEngineSupports } from './engineSupports/engineSupports';
import frame, { type PluginFrame } from './frame/frame';
import logOptions, { type PluginLogOptions } from './logOptions/logOptions';
import options, { type PluginOptions } from './options/options';
import selectors, { type PluginSelectors } from './selectors/selectors';
import skipSublingIfResult, { type PluginSkipSublingIfResult } from './skipSublingIfResult/skipSublingIfResult';

export type PliginsFields = Partial<PluginSkipSublingIfResult> &
  Partial<PluginDebug> &
  Partial<PluginArgsRedefine> &
  Partial<PluginDescriptionError> &
  Partial<PluginEngineSupports> &
  Partial<PluginFrame> &
  Partial<PluginLogOptions> &
  Partial<PluginContinueOnError> &
  Partial<PluginOptions> &
  Partial<PluginSelectors>;

export type { PluginContinueOnError };
export type { PluginDebug };
export type { PluginSkipSublingIfResult };
export type { PluginDescriptionError };
export type { PluginEngineSupports };
export type { PluginArgsRedefine };
export type { PluginFrame };
export type { PluginLogOptions };
export type { PluginOptions };
export type { PluginSelectors };

export default {
  continueOnError,
  debug,
  skipSublingIfResult,
  argsRedefine,
  descriptionError,
  engineSupports,
  frame,
  logOptions,
  options,
  selectors,
};

export const pluginsListDefault: PluginList = {
  argsRedefine: { plugin: 'argsRedefine', order: 100 },
  logOptions: { plugin: 'logOptions', order: 150 },
  options: { plugin: 'options', order: 160 },
  selectors: { plugin: 'selectors', order: 170 },
  descriptionError: { plugin: 'descriptionError', order: 200 },
  continueOnError: { plugin: 'continueOnError', order: 300 },
  skipSublingIfResult: { plugin: 'skipSublingIfResult', order: 400 },
  engineSupports: { plugin: 'engineSupports', order: 500 },
  frame: { plugin: 'frame', order: 600 },
  debug: { plugin: 'debug' },
};
