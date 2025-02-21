import Singleton from './Singleton';
import { ArgumentsKeysType, ArgumentsType } from './global.d';
import { argsDefault } from './Defaults';
import { mergeObjects } from './Helpers';

const DELIMITER = ',';

const resolveBoolean = <T>(key: ArgumentsKeysType, val: T): boolean | T => {
  if (typeof argsDefault[key] !== 'boolean' || typeof val === 'boolean') {
    return val;
  }
  const newVal = typeof val === 'string' && ['true', 'false'].includes(val) ? val === 'true' : val;
  if (typeof newVal !== 'boolean') {
    throw new Error(`Invalid argument type '${key}', 'boolean' required.`);
  }
  return newVal;
};

const resolveArray = <T>(key: ArgumentsKeysType, val: T): string[] | T => {
  if (!Array.isArray(argsDefault[key])) {
    return val;
  }

  let newVal: string[] | null = null;

  if (Array.isArray(val)) {
    newVal = val;
  }

  if (typeof val === 'string') {
    try {
      newVal = JSON.parse(val);
    } catch {
      newVal = val.split(DELIMITER).map((v: string) => v.trim());
    }
  }

  if (!Array.isArray(newVal)) {
    throw new Error(`Invalid argument type '${key}', 'array' required.`);
  }

  return [...new Set(newVal.filter((v) => v !== null && v !== undefined && v !== ''))];
};

const resolveObject = <T>(key: ArgumentsKeysType, val: T): Record<string, unknown> | T => {
  if (
    typeof argsDefault[key] !== 'object' ||
    Array.isArray(argsDefault[key]) ||
    (typeof val === 'object' && !Array.isArray(val))
  ) {
    return val;
  }
  let newVal: Record<string, unknown> | null = null;
  if (typeof val === 'string') {
    try {
      newVal = JSON.parse(val);
    } catch {
      throw new Error(`Invalid argument type '${key}', 'object' required.`);
    }
  }
  if (!newVal || Array.isArray(newVal)) {
    throw new Error(`Invalid argument type '${key}', 'object' required.`);
  }
  return newVal;
};

const resolveString = <T>(key: ArgumentsKeysType, val: T): string | T => {
  if (typeof argsDefault[key] !== 'string' || (typeof argsDefault[key] === 'string' && typeof val === 'string')) {
    return val;
  }
  throw new Error(`Invalid argument type '${key}', 'string' required.`);
};

const resolveNumber = <T>(key: ArgumentsKeysType, val: T): number | T => {
  if (typeof argsDefault[key] !== 'number' || typeof val === 'number') {
    return val;
  }
  const newVal = typeof val === 'string' && parseFloat(val);
  if (typeof newVal !== 'number' || Number.isNaN(newVal)) {
    throw new Error(`Invalid argument type '${key}', 'number' required.`);
  }
  return newVal;
};

/**
 * It takes an object of arguments and returns an object of arguments
 * @param args - Partial<ArgumentsType> = {}: This is the object that we're going to parse.
 * @returns Resolved object.
 */
export const parser = (args: Partial<ArgumentsType> = {}): Partial<ArgumentsType> => {
  const params: ArgumentsKeysType[] = Object.keys(argsDefault) as ArgumentsKeysType[];
  const result = params.reduce<Partial<ArgumentsType>>(
    (acc: Partial<ArgumentsType>, key: ArgumentsKeysType): Partial<ArgumentsType> => {
      let newVal = args[key];
      if (newVal === undefined) {
        return acc;
      }
      newVal = resolveBoolean(key, newVal);
      newVal = resolveArray(key, newVal);
      newVal = resolveObject(key, newVal);
      newVal = resolveString(key, newVal);
      newVal = resolveNumber(key, newVal);
      return { ...acc, ...{ [key]: newVal } };
    },
    {},
  );
  return result;
};

/**
 * It takes the command line arguments, filters out the ones that are not in the default arguments, and then parses them
 * @returns parsed arguments
 */
const parseCLI = (): Partial<ArgumentsType> => {
  const params = Object.keys(argsDefault);
  const argsRaw = process.argv
    .map((v: string) => v.split(/\s+/))
    .flat()
    .map((v: string) => v.replace(/'/g, '"'))
    .map((v: string) => v.split('='))
    .filter((v: string[]) => v.length > 1)
    .filter((v: string[]) => params.includes(v[0]));
  return parser(Object.fromEntries(argsRaw));
};

/**
 * Class representing a collection of global arguments for the application.
 * This class extends the Singleton pattern to ensure a single instance of arguments across the app.
 * It handles parsing and merging of arguments from various sources including default values,
 * configuration files, environment variables, command-line inputs, and programmatically passed arguments.
 * The class provides a centralized way to manage and access all global settings and parameters
 * used throughout the application, ensuring consistency and ease of configuration.
 *
 * Usage examples:
 *
 * 1. Creating an instance with default arguments:
 *    const args = new Arguments();
 *
 * 2. Creating an instance with custom arguments:
 *    const customArgs = { PPD_DEBUG_MODE: true, PPD_OUTPUT: 'custom_output' };
 *    const args = new Arguments(customArgs);
 *
 * 3. Accessing arguments:
 *    const debugMode = args.args.PPD_DEBUG_MODE;
 *    const outputFolder = args.args.PPD_OUTPUT;
 *
 * 4. Reinitializing with new arguments:
 *    const newArgs = { PPD_LOG_SCREENSHOT: true, PPD_LOG_LEVEL_NESTED: 2 };
 *    const args = new Arguments(newArgs, {}, true);
 */
export class Arguments extends Singleton {
  private _args: ArgumentsType;

  constructor(args: Partial<ArgumentsType> = {}, argsConfig: Partial<ArgumentsType> = {}, reInit = false) {
    super();
    this._args = this.initializeArgs(args, argsConfig, reInit);
  }

  private initializeArgs(
    args: Partial<ArgumentsType>,
    argsConfig: Partial<ArgumentsType>,
    reInit: boolean,
  ): ArgumentsType {
    if (reInit || !this._args) {
      const argsInput = parser(args);

      const argsEnv = parser(
        Object.entries(process.env).reduce<Record<string, string>>((acc, [key, value]) => {
          acc[key] = value?.toString() ?? '';
          return acc;
        }, {}),
      );

      const argsCLI = parseCLI();

      const parsedArgs = parser(
        mergeObjects<Partial<ArgumentsType>>([argsDefault, parser(argsConfig), argsEnv, argsCLI, argsInput], true),
      ) as ArgumentsType;

      return parsedArgs;
    }
    return this._args;
  }

  public get args(): ArgumentsType {
    return this._args;
  }
}
