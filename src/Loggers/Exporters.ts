import fs from 'fs';
import path from 'path';
import { Environment } from '../Environment';
import { LogEntrieType, LogEntry, LogExporter, LogExporterOptions } from '../global.d';
import { paintString } from '../Helpers';

export const consoleLog = (entries: LogEntrieType[][]): void => {
  entries.forEach((entry) => {
    const line = entry
      .map((part) => {
        let text = paintString(part.text, part.textColor);
        if (part.backgroundColor && part.backgroundColor !== 'sane') {
          text = paintString(text, part.backgroundColor);
        }
        return text;
      })
      .join('');
    console.log(line);
  });
};

export const fileLog = (envsId: string, texts: string | LogEntrieType[][] = [], fileName = 'output.log'): void => {
  const { folderLatest = '.', folder = '.' } = new Environment().getOutput(envsId);

  let textsJoin = '';
  if (Array.isArray(texts)) {
    textsJoin = texts.map((text) => text.map((log) => log.text || '').join('')).join('\n');
  } else {
    textsJoin = texts.toString();
  }

  // eslint-disable-next-line no-control-regex
  textsJoin = textsJoin.replace(/\[\d+m/gi, '');

  fs.appendFileSync(path.join(folder, fileName), `${textsJoin}\n`);
  fs.appendFileSync(path.join(folderLatest, fileName), `${textsJoin}\n`);
};

export const exporterConsole: LogExporter = async (
  logEntry: LogEntry,
  logEntryFormated: LogEntrieType[][],
  logString: string,
  options: LogExporterOptions,
): Promise<void> => {
  if (options.skipThis) {
    return;
  }
  consoleLog(logEntryFormated);
};

export const exporterLogFile: LogExporter = async (
  logEntry: LogEntry,
  logEntryFormated: LogEntrieType[][],
  logString: string,
  options: LogExporterOptions,
): Promise<void> => {
  if (options.skipThis) {
    return;
  }
  fileLog(options.envsId, logEntryFormated, 'output.log');
};

export const exporterSocket: LogExporter = async (
  logEntry: LogEntry,
  logEntryFormated: LogEntrieType[][],
  logString: string,
  options: LogExporterOptions,
): Promise<void> => {
  const socket = new Environment().getSocket(options.envsId);
  socket.sendYAML({ type: 'log', data: logEntry, envsId: options.envsId });
};

export const exporterYamlLog: LogExporter = async (
  logEntry: LogEntry,
  logEntryFormated: LogEntrieType[][],
  logString: string,
  options: LogExporterOptions,
): Promise<void> => {
  fileLog(options.envsId, logString, 'output.yaml');
};

export const exporterLogInMemory: LogExporter = async (
  logEntry: LogEntry,
  logEntryFormated: LogEntrieType[][],
  logString: string,
  options: LogExporterOptions,
): Promise<void> => {
  const { log } = new Environment().getEnvInstance(options.envsId);
  log.push(logEntry);
};
