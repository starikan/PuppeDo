import Singleton from './Singleton';

const argsDefault: ArgumentsType = {
  PPD_ROOT: process.cwd(),
  PPD_ROOT_ADDITIONAL: [],
  PPD_ROOT_IGNORE: ['.git', 'node_modules', '.history', 'output'],
  PPD_ENVS: [],
  PPD_TESTS: [],
  PPD_OUTPUT: 'output',
  PPD_DATA: {},
  PPD_SELECTORS: {},
  PPD_DEBUG_MODE: false,
  PPD_LOG_DISABLED: false,
  PPD_LOG_EXTEND: false,
  PPD_DISABLE_ENV_CHECK: false,
  PPD_LOG_LEVEL_NESTED: 0,
  PPD_LOG_LEVEL_TYPE: 'raw',
  PPD_LOG_LEVEL_TYPE_IGNORE: [],
  PPD_LOG_SCREENSHOT: false,
  PPD_LOG_FULLPAGE: false,
};

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
  if (!Array.isArray(argsDefault[key]) || Array.isArray(val)) {
    return val;
  }
  let newVal: string[] | null = null;
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
  return newVal;
};

const resolveObject = <T>(key: ArgumentsKeysType, val: T): Object | T => {
  if (
    typeof argsDefault[key] !== 'object' ||
    Array.isArray(argsDefault[key]) ||
    (typeof val === 'object' && !Array.isArray(val))
  ) {
    return val;
  }
  let newVal: Object | null = null;
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
    (acc: Partial<ArgumentsType> = {}, key: ArgumentsKeysType): Partial<ArgumentsType> => {
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

const parseCLI = (): Object => {
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

export default class Arguments extends Singleton {
  args: ArgumentsType;
  argsJS: Partial<ArgumentsType>;
  argsEnv: Partial<ArgumentsType>;
  argsCLI: Partial<ArgumentsType>;

  constructor(args: Partial<ArgumentsType> = {}, reInit: boolean = false) {
    super();
    if (reInit || !this.args) {
      this.init(args);
    }
  }

  init(args: Object = {}): void {
    this.argsJS = parser(args);
    this.argsEnv = parser(process.env);
    this.argsCLI = parseCLI();
    this.args = { ...argsDefault, ...this.argsEnv, ...this.argsCLI, ...this.argsJS };
  }
}
