/* eslint-disable implicit-arrow-linebreak */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import deepmerge from 'deepmerge';
import dayjs from 'dayjs';

import { Outputs, SocketType, TestFunctionsBlockNames } from './global.d';
import { Arguments } from './Arguments';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function merge<T>(...objects: T[]): T {
  return deepmerge.all(objects, { arrayMerge: (_, source) => source });
}

/*
https://stackoverflow.com/questions/23975735/what-is-this-u001b9-syntax-of-choosing-what-color-text-appears-on-console

SANE = "\u001B[0m"

HIGH_INTENSITY = "\u001B[1m"
LOW_INTENSITY = "\u001B[2m"

ITALIC = "\u001B[3m"
UNDERLINE = "\u001B[4m"
BLINK = "\u001B[5m"
RAPID_BLINK = "\u001B[6m"
REVERSE_VIDEO = "\u001B[7m"
INVISIBLE_TEXT = "\u001B[8m"

BACKGROUND_BLACK = "\u001B[40m"
BACKGROUND_RED = "\u001B[41m"
BACKGROUND_GREEN = "\u001B[42m"
BACKGROUND_YELLOW = "\u001B[43m"
BACKGROUND_BLUE = "\u001B[44m"
BACKGROUND_MAGENTA = "\u001B[45m"
BACKGROUND_CYAN = "\u001B[46m"
BACKGROUND_WHITE = "\u001B[47m"
*/
export enum colors {
  sane = 0,
  black = 30,
  red = 31,
  green = 32,
  yellow = 33,
  blue = 34,
  magenta = 35,
  cyan = 36,
  white = 37,
  blackBackground = 40,
  redBackground = 41,
  greenBackground = 42,
  yellowBackground = 43,
  blueBackground = 44,
  magentaBackground = 45,
  cyanBackground = 46,
  whiteBackground = 47,
  raw = colors.sane,
  timer = colors.sane,
  debug = colors.sane,
  info = colors.cyan,
  test = colors.green,
  warn = colors.yellow,
  error = colors.red,
  trace = colors.cyan,
  env = colors.blue,
}

export const paintString = (str: string, color: keyof typeof colors = 'sane'): string =>
  `\u001b[${colors[color] || 0}m${str}\u001b[0m`;

export const blankSocket: SocketType = {
  send: () => {
    // Do nothing
  },
  sendYAML: () => {
    // Do nothing
  },
};

export const getTimer = (timeStart: bigint = process.hrtime.bigint()): { now: bigint; delta: string } => {
  const seconds = Number(process.hrtime.bigint() - timeStart) / 1e9;
  let delta = `${seconds.toFixed(3)} s.`;
  if (seconds > 60) {
    delta = `${Math.floor(seconds / 60)} min. ${(seconds % 60).toFixed(3)} s.`;
  }
  return {
    now: process.hrtime.bigint(),
    delta,
  };
};

export const pick = (obj: Record<string, unknown>, fields: string[]): Record<string, unknown> =>
  Object.fromEntries(Object.entries(obj).filter(([key]) => fields.includes(key)));

export const omit = (obj: Record<string, unknown>, fields: string[]): Record<string, unknown> =>
  Object.fromEntries(Object.entries(obj).filter(([key]) => !fields.includes(key)));

export const getNowDateTime = (now: Date = new Date(), format = 'YYYY-MM-DD_HH-mm-ss.SSS'): string =>
  dayjs(now).format(format);

export const walkSync = (
  dir: string,
  options: { ignoreFolders: string[]; extensions?: string[]; ignoreFiles: string[] } = {
    ignoreFolders: [],
    ignoreFiles: [],
  },
): string[] => {
  const baseDir = path.basename(dir);
  if (!fs.existsSync(dir) || options.ignoreFolders.includes(baseDir)) {
    return [];
  }
  if (!fs.statSync(dir).isDirectory()) {
    return [dir];
  }
  const dirs = fs
    .readdirSync(dir)
    .map((f) => walkSync(path.join(dir, f), options))
    .flat()
    .filter((v) => !options.ignoreFiles.includes(v))
    .filter((v) => (options.extensions ? options.extensions.includes(path.parse(v).ext) : true));
  return dirs;
};

export const RUNNER_BLOCK_NAMES: TestFunctionsBlockNames[] = ['beforeTest', 'runTest', 'afterTest'];

export const generateId = (length = 6): string => crypto.randomBytes(length).toString('hex');

export const resolveOutputHtmlFile = (): string => {
  const outputSourceRaw = path.resolve(path.join('dist', 'output.html'));
  const outputSourceModule = path.resolve(
    path.join(__dirname, '..', 'node_modules', '@puppedo', 'core', 'dist', 'output.html'),
  );
  const outputSource = fs.existsSync(outputSourceRaw) ? outputSourceRaw : outputSourceModule;
  return outputSource;
};

export const initOutputLatest = (): Partial<Outputs> => {
  const { PPD_OUTPUT: output } = new Arguments().args;

  const folderLatest = path.join(output, 'latest');

  if (!fs.existsSync(output)) {
    fs.mkdirSync(output);
  }

  // Create latest log path
  if (!fs.existsSync(folderLatest)) {
    fs.mkdirSync(folderLatest);
  } else {
    const filesExists = fs.readdirSync(folderLatest);
    for (const fileExists of filesExists) {
      fs.unlinkSync(path.join(folderLatest, fileExists));
    }
  }

  fs.copyFileSync(resolveOutputHtmlFile(), path.join(folderLatest, 'output.html'));

  return {
    folderLatest,
    folderLatestFull: path.resolve(folderLatest),
  };
};

export const initOutput = (envsId: string): Partial<Outputs> => {
  const { PPD_OUTPUT: output } = new Arguments().args;

  if (!fs.existsSync(output)) {
    fs.mkdirSync(output);
  }
  const now = getNowDateTime();

  const folder = path.join(output, `${now}_${envsId}`);
  fs.mkdirSync(folder);

  fs.copyFileSync(resolveOutputHtmlFile(), path.join(folder, 'output.html'));

  // Cleanup latest folder
  initOutputLatest();

  return {
    output,
    name: envsId,
    folder,
    folderFull: path.resolve(folder),
  };
};
