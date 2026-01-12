import { omit } from '../Helpers';
import type { LogEntry, LogTransformer } from '../model';

export const transformerEquity: LogTransformer = async (logEntry: LogEntry) => logEntry;

export const transformerYamlLog: LogTransformer = async (logEntry: LogEntry) => omit(logEntry, ['error']);
