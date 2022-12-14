import { deepmerge } from 'deepmerge-ts';
import Singleton from './Singleton';
import { ArgumentsKeysType, ArgumentsType } from './global.d';
import { argsDefault } from './Defaults';

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
    } catch (error) {
      newVal = val.split(',').map((v: string) => v.trim());
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
    } catch (error) {
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
  const newVal = typeof val === 'string' && parseInt(val, 10);
  if (typeof newVal !== 'number' || Number.isNaN(newVal)) {
    throw new Error(`Invalid argument type '${key}', 'number' required.`);
  }
  return newVal;
};

const parser = (args: Partial<ArgumentsType> = {}): Partial<ArgumentsType> => {
  const params: ArgumentsKeysType[] = Object.keys(argsDefault) as ArgumentsKeysType[];
  const result = params.reduce<Partial<ArgumentsType>>(
    (acc: Partial<ArgumentsType>, key: keyof ArgumentsType): Partial<ArgumentsType> => {
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

export class Arguments extends Singleton {
  args!: ArgumentsType;

  constructor(args: Partial<ArgumentsType> = {}, argsConfig: Partial<ArgumentsType> = {}, reInit = false) {
    super();
    if (reInit || !this.args) {
      const argsInput = parser(args);
      const argsEnv = parser(process.env as Record<string, string>);
      const argsCLI = parseCLI();

      this.args = parser(deepmerge(argsDefault, parser(argsConfig), argsEnv, argsCLI, argsInput)) as ArgumentsType;
    }
  }
}
