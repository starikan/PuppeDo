import Singleton from './Singleton';

const argsDefault = {
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

type ArgumentsType = typeof argsDefault;
// type ArgumentsKeysType = keyof typeof argsDefault;

const resolveBoolean = <T>(key: string, val: T): boolean | T => {
  if (typeof argsDefault[key] !== 'boolean') {
    return val;
  }

  const newVal = typeof val === 'string' && ['true', 'false'].includes(val) ? val === 'true' : val;

  if (typeof newVal !== 'boolean') {
    throw new Error(`Invalid argument type '${key}', 'boolean' required.`);
  }

  return newVal;
};

const parser = (args: Object = {}): Object => {
  const params = Object.keys(argsDefault);
  return params.reduce((s, val) => {
    let newVal = args[val];
    if (newVal === undefined) {
      return s;
    }

    newVal = resolveBoolean(val, newVal);

    if (Array.isArray(argsDefault[val])) {
      if (typeof newVal === 'string') {
        try {
          newVal = JSON.parse(newVal);
        } catch (error) {
          newVal = newVal.split(',').map((v: string) => v.trim());
        }
      }

      if (!Array.isArray(newVal)) {
        throw new Error(`Invalid argument type '${val}', 'array' required.`);
      }
    }

    if (typeof argsDefault[val] === 'object' && !Array.isArray(argsDefault[val])) {
      if (typeof newVal === 'string') {
        try {
          newVal = JSON.parse(newVal);
        } catch (error) {
          throw new Error(`Invalid argument type '${val}', 'object' required.`);
        }
      }

      if (typeof newVal !== 'object' || Array.isArray(newVal)) {
        throw new Error(`Invalid argument type '${val}', 'object' required.`);
      }
    }

    if (typeof argsDefault[val] === 'string' && typeof newVal !== 'string') {
      throw new Error(`Invalid argument type '${val}', 'string' required.`);
    }

    if (typeof argsDefault[val] === 'number') {
      if (typeof newVal === 'string') {
        newVal = parseInt(newVal, 10);
      }

      if (typeof newVal !== 'number' || Number.isNaN(newVal)) {
        throw new Error(`Invalid argument type '${val}', 'number' required.`);
      }
    }

    const collector = { ...s, ...{ [val]: newVal } };
    return collector;
  }, {});
};

const parseCLI = (): Object => {
  const params = Object.keys(argsDefault);
  const argsRaw = process.argv
    .map((v: string) => v.split(/\s+/))
    .flat()
    .map((v: string) => v.split('='))
    .filter((v: string[]) => v.length > 1)
    .filter((v: string[]) => params.includes(v[0]));
  return parser(Object.fromEntries(argsRaw));
};

export default class Arguments extends Singleton {
  args: ArgumentsType;
  argsJS: Object;
  argsEnv: Object;
  argsCLI: Object;

  constructor(args: Object = {}, reInit: boolean = false) {
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
