/* eslint-disable implicit-arrow-linebreak */
import crypto from 'crypto';
import dayjs from 'dayjs';
import {
  AliasesKeysType,
  ColorsType,
  DeepMergeable,
  SocketType,
  TestExtendType,
  TestFunctionsBlockNames,
} from './global.d';
import { PPD_ALIASES } from './Defaults';

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
export function mergeObjects<T extends DeepMergeable>(objects: T[], uniqueArray = false): T {
  /**
   * Recursive function for merging objects.
   *
   * @param target - The target object.
   * @param source - The source for merging.
   */
  function deepMerge(target: DeepMergeable, source: DeepMergeable): DeepMergeable {
    // If source is arrays, merge with target:
    if (Array.isArray(source)) {
      const merged = Array.isArray(target) ? target.concat(source) : source;
      if (uniqueArray) {
        const seen = new Set();
        const deduped = [];
        for (const item of merged) {
          if (item === null || (typeof item !== 'object' && typeof item !== 'function')) {
            if (!seen.has(item)) {
              seen.add(item);
              deduped.push(item);
            }
          } else {
            deduped.push(item);
          }
        }
        return deduped;
      }
      return merged;
    }

    // If source is an object (but not an array)
    if (typeof source === 'object' && source !== null) {
      const result = typeof target !== 'object' || target === null || Array.isArray(target) ? {} : { ...target };

      for (const key of Object.keys(source)) {
        if (source[key] !== undefined) {
          if (Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] ?? [], source[key] as DeepMergeable);
          } else if (typeof source[key] === 'object' && source[key] !== null) {
            result[key] = deepMerge(result[key] ?? {}, source[key] as DeepMergeable);
          } else {
            result[key] = source[key] as DeepMergeable;
          }
        }
      }
      return result;
    }

    return source;
  }

  // Initialize the result based on the type of the first element of the input array
  let result!: DeepMergeable;

  if (objects.length > 0) {
    result = Array.isArray(objects[0]) ? [] : {};
  } else {
    result = {};
  }

  // Merge all passed objects
  for (const obj of objects) {
    result = deepMerge(result, obj);
  }

  return result as T;
}

/**
 * Deeply merges two objects, obj1 and obj2, based on the specified fieldsMerge.
 * The function returns a new object that combines the properties of obj1 and obj2.
 * If a property is present in both objects, the values are merged recursively.
 *
 * @param obj1 The first object to merge.
 * @param obj2 The second object to merge.
 * @param fieldsMerge An array of keys to merge recursively.
 * @returns A new object that combines the properties of obj1 and obj2.
 */
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

export const RUNNER_BLOCK_NAMES: TestFunctionsBlockNames[] = ['beforeTest', 'runTest', 'afterTest'];

export const generateId = (length = 6): string => crypto.randomBytes(length).toString('hex');

/**
 * Resolves aliases for a given key in the inputs object.
 *
 * @param alias The alias key to resolve.
 * @param inputs The inputs object to search for alias values.
 * @returns The resolved alias value.
 */
export const resolveAliases = <T extends DeepMergeable = DeepMergeable>(
  alias: AliasesKeysType,
  inputs: TestExtendType,
): T => {
  const variants = [...(PPD_ALIASES[alias] ?? []), alias];
  const values = (Object.values(pick(inputs, variants)) as T[]).map((v) => v || ({} as T));
  const result = values.length ? mergeObjects<T>(values) : [];
  return result as T;
};
