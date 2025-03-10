import { LogEntry, LogTransformer } from '../model';
import { omit } from '../Helpers';

export const transformerEquity: LogTransformer = async (logEntry: LogEntry) => logEntry;

export const transformerYamlLog: LogTransformer = async (logEntry: LogEntry) => omit(logEntry, ['error']);
