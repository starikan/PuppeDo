import _ from 'lodash';

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

export default class Arguments extends Singleton {
  args: ArgumentsType;
  argsJS: Object;
  argsEnv: Object;
  argsCLI: Object;
  argsTypes: Object;

  constructor(args: Object = {}, reInit: boolean = false) {
    super();
    if (reInit || !this.args) {
      this.init(args);
    }
  }

  init(args: Object = {}): void {
    this.argsTypes = Arguments.getTypes();
    this.argsJS = this.parser(args);
    this.argsEnv = this.parser(_.pick(process.env, Object.keys(argsDefault)));
    this.argsCLI = this.parseCLI();
    this.args = { ...argsDefault, ...this.argsEnv, ...this.argsCLI, ...this.argsJS };
  }

  static getTypes(): Object {
    return Object.keys(argsDefault).reduce((s, v) => {
      let vType: string;
      if (_.isString(argsDefault[v])) {
        vType = 'string';
      }
      if (_.isBoolean(argsDefault[v])) {
        vType = 'boolean';
      }
      // Object must be before array
      if (_.isObject(argsDefault[v])) {
        vType = 'object';
      }
      if (_.isArray(argsDefault[v])) {
        vType = 'array';
      }
      if (_.isNumber(argsDefault[v])) {
        vType = 'number';
      }
      return { ...s, ...{ [v]: vType } };
    }, {});
  }

  parser(args: Object = {}): Object {
    const params = Object.keys(argsDefault);
    return params.reduce((s, val) => {
      let newVal = args[val];
      if (newVal === undefined) {
        return s;
      }

      if (typeof argsDefault[val] === 'boolean') {
        if (['true', 'false'].includes(newVal)) {
          newVal = newVal === 'true';
        }
        if (typeof newVal !== 'boolean') {
          throw new Error(`Invalid argument type '${val}', 'boolean' required.`);
        }
      }

      if (this.argsTypes[val] === 'array') {
        if (_.isString(newVal)) {
          try {
            newVal = JSON.parse(newVal);
          } catch (error) {
            newVal = newVal.split(',').map((v: string) => v.trim());
          }
        } else if (!_.isArray(newVal)) {
          throw new Error(`Invalid argument type '${val}', 'array' required.`);
        }
      }

      if (this.argsTypes[val] === 'object') {
        if (_.isString(newVal)) {
          try {
            newVal = JSON.parse(newVal);
          } catch (error) {
            throw new Error(`Invalid argument type '${val}', 'object' required.`);
          }
        } else if (!_.isObject(newVal) || _.isArray(newVal)) {
          throw new Error(`Invalid argument type '${val}', 'object' required.`);
        }
      }

      if (this.argsTypes[val] === 'string') {
        if (!_.isString(newVal)) {
          throw new Error(`Invalid argument type '${val}', 'string' required.`);
        }
      }

      if (this.argsTypes[val] === 'number') {
        if (_.isString(newVal)) {
          newVal = parseInt(newVal, 10);
        }
        if (!_.isNumber(newVal) || _.isNaN(newVal)) {
          throw new Error(`Invalid argument type '${val}', 'number' required.`);
        }
      }

      const collector = { ...s, ...{ [val]: newVal } };
      return collector;
    }, {});
  }

  parseCLI(): Object {
    const params = Object.keys(argsDefault);
    const argsRaw = process.argv
      .map((v: string) => v.split(/\s+/))
      .flat()
      .map((v: string) => v.split('='))
      .filter((v: string[]) => v.length > 1)
      .filter((v: string[]) => params.includes(v[0]));
    return this.parser(Object.fromEntries(argsRaw));
  }
}
