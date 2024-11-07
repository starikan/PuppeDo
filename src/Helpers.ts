/* eslint-disable no-param-reassign */
/* eslint-disable implicit-arrow-linebreak */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { ColorsType, DeepMergeable, SocketType, TestFunctionsBlockNames } from './global.d';

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

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Merges multiple objects into one.
 *
 * @param objects - Objects for merging.
 * @returns - The result of the merge.
 */
export function mergeObjects<T extends DeepMergeable>(...objects: T[]): T {
  /**
   * Recursive function for merging objects.
   *
   * @param target - The target object.
   * @param source - The source for merging.
   */
  function deepMerge(target: DeepMergeable, source: DeepMergeable): void {
    for (const key of Object.keys(source)) {
      if (key in source) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          // If the field is an object, recursively merge
          if (!target[key]) {
            target[key] = {} as DeepMergeable;
          }
          deepMerge(target[key] as DeepMergeable, source[key] as DeepMergeable);
        } else if (Array.isArray(source[key])) {
          // If the field is an array, merge arrays
          target[key] = target[key]
            ? (target[key] as DeepMergeable[]).concat(source[key] as DeepMergeable[])
            : source[key];
        } else if (source[key] !== undefined) {
          target[key] = source[key];
        }
      }
    }
  }

  // Initialize the resulting object
  const result: DeepMergeable = {};

  // Merge all passed objects
  for (const obj of objects) {
    deepMerge(result, obj);
  }

  return result as T;
}

export const deepMergeField = <T extends Record<string, unknown>>(
  obj1: T,
  obj2: Partial<T>,
  fieldsMerge: Array<keyof T>,
): T => {
  const mergedFields = fieldsMerge.reduce((acc: Partial<T>, v) => {
    acc[v] = { ...(obj1[v] ?? {}), ...(obj2[v] ?? {}) } as T[keyof T];
    return acc;
  }, {});

  const result = { ...obj1, ...obj2, ...mergedFields };
  return result;
};

export const paintString = (str: string, color: ColorsType = 'sane'): string => {
  if (['sane', 'raw', 'timer', 'debug'].includes(color)) {
    return str;
  }
  return `\u001b[${colors[color] || 0}m${str}\u001b[0m`;
};

export const blankSocket: SocketType = {
  send: () => {
    // Do nothing
  },
  sendYAML: () => {
    // Do nothing
  },
};

export const getTimer = ({
  timeStartBigInt,
  timeEndBigInt,
  timeStart,
  timeEnd,
}: {
  timeStartBigInt?: bigint;
  timeEndBigInt?: bigint;
  timeStart?: Date;
  timeEnd?: Date;
} = {}): {
  timeStart: Date;
  timeEnd: Date;
  timeStartBigInt: bigint;
  timeEndBigInt: bigint;
  deltaStr: string;
  delta: number;
} => {
  const timeStartBigIntResolved = timeStartBigInt ?? process.hrtime.bigint();
  const timeEndBigIntResolved = timeEndBigInt ?? process.hrtime.bigint();
  const timeStartResolved = timeStart ?? new Date();
  const timeEndResolved = timeEnd ?? new Date();

  const delta = Number(timeEndBigIntResolved - timeStartBigIntResolved) / 1e9;

  let deltaStr = `${delta.toFixed(3)} s.`;
  if (delta > 60) {
    deltaStr = `${Math.floor(delta / 60)} min. ${(delta % 60).toFixed(3)} s.`;
  }
  return {
    timeStart: timeStartResolved,
    timeEnd: timeEndResolved,
    timeStartBigInt: timeStartBigIntResolved,
    timeEndBigInt: timeEndBigIntResolved,
    deltaStr,
    delta,
  };
};

export const pick = (obj: Record<string, unknown>, fields: string[]): Record<string, unknown> =>
  Object.fromEntries(Object.entries(obj).filter(([key]) => fields.includes(key)));

export const omit = (obj: Record<string, unknown>, fields: string[]): Record<string, unknown> =>
  Object.fromEntries(Object.entries(obj).filter(([key]) => !fields.includes(key)));

export const getNowDateTime = (now: Date = new Date(), format = 'YYYY-MM-DD_HH-mm-ss.SSS'): string =>
  dayjs(now).format(format);

/**
 * Synchronously walks through a directory and its subdirectories, returning an array of file paths.
 *
 * @param dir - The directory to start walking from.
 * @param options - An object with options for the walk.
 * @param options.ignoreFolders - An array of folder names to ignore.
 * @param options.includeExtensions - An array of file extensions to include.
 * @param options.ignoreFiles - An array of file names to ignore.
 * @param options.depth - The maximum depth to walk.
 * @returns An array of file paths.
 */
export const walkSync = (
  dir: string,
  options: { ignoreFolders?: string[]; includeExtensions?: string[]; ignoreFiles?: string[]; depth?: number } = {
    ignoreFolders: [],
    ignoreFiles: [],
  },
): string[] => {
  const baseDir = path.basename(dir);
  if (!fs.existsSync(dir) || options.ignoreFolders?.includes(baseDir)) {
    return [];
  }
  if (!fs.statSync(dir).isDirectory()) {
    return [dir];
  }
  const dirs = fs
    .readdirSync(dir)
    .map((f) => {
      if (options.depth === undefined || options.depth > 0) {
        return walkSync(path.join(dir, f), { ...options, depth: options.depth ? options.depth - 1 : undefined });
      }
      return [];
    })
    .flat()
    .filter((v) => !options.ignoreFiles?.some((s) => v.endsWith(s)))
    .filter((v) => (options.includeExtensions ? options.includeExtensions.includes(path.parse(v).ext) : true));
  return dirs;
};

export const RUNNER_BLOCK_NAMES: TestFunctionsBlockNames[] = ['beforeTest', 'runTest', 'afterTest'];

export const generateId = (length = 6): string => crypto.randomBytes(length).toString('hex');
