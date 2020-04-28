import _ from 'lodash';

import Singleton from './Singleton';

type ArgumentsType = {
  PPD_ROOT: any;
  PPD_ROOT_ADDITIONAL: any;
  PPD_ROOT_IGNORE: any;
  PPD_ENVS: any;
  PPD_TESTS: any;
  PPD_OUTPUT: any;
  PPD_DATA: any;
  PPD_SELECTORS: any;
  PPD_DEBUG_MODE: any;
  PPD_LOG_DISABLED: any;
  PPD_LOG_EXTEND: any;
  PPD_DISABLE_ENV_CHECK: any;
  PPD_LOG_LEVEL_NESTED: any;
  PPD_LOG_LEVEL_TYPE: any;
  PPD_LOG_LEVEL_TYPE_IGNORE: any;
  PPD_LOG_SCREENSHOT: any;
  PPD_LOG_FULLPAGE: any;
};

type ArgumentsNotStrictType = {
  PPD_ROOT?: any;
  PPD_ROOT_ADDITIONAL?: any;
  PPD_ROOT_IGNORE?: any;
  PPD_ENVS?: any;
  PPD_TESTS?: any;
  PPD_OUTPUT?: any;
  PPD_DATA?: any;
  PPD_SELECTORS?: any;
  PPD_DEBUG_MODE?: any;
  PPD_LOG_DISABLED?: any;
  PPD_LOG_EXTEND?: any;
  PPD_DISABLE_ENV_CHECK?: any;
  PPD_LOG_LEVEL_NESTED?: any;
  PPD_LOG_LEVEL_TYPE?: any;
  PPD_LOG_LEVEL_TYPE_IGNORE?: any;
  PPD_LOG_SCREENSHOT?: any;
  PPD_LOG_FULLPAGE?: any;
};

export default class Arguments extends Singleton {
  args: ArgumentsType;
  argsDefault: ArgumentsType;
  argsJS: ArgumentsNotStrictType;
  argsEnv: ArgumentsNotStrictType;
  argsCLI: ArgumentsNotStrictType;
  argsTypes: ArgumentsNotStrictType;

  constructor(args: ArgumentsNotStrictType = {}, reInit: boolean = false) {
    super();
    if (reInit || !this.args) {
      this.init(args);
    }
  }

  init(args: ArgumentsNotStrictType = {}): void {
    this.argsDefault = {
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
    this.argsTypes = Arguments.getTypes(this.argsDefault);

    this.argsJS = this.parser(args);
    this.argsEnv = this.parser(_.pick(process.env, Object.keys(this.argsDefault)));
    this.argsCLI = this.parseCLI();
    this.args = { ...this.argsDefault, ...this.argsEnv, ...this.argsCLI, ...this.argsJS };
  }

  static getTypes(args) {
    return Object.keys(args).reduce((s, v) => {
      let vType;
      if (_.isString(args[v])) {
        vType = 'string';
      }
      if (_.isBoolean(args[v])) {
        vType = 'boolean';
      }
      // Object must be before array
      if (_.isObject(args[v])) {
        vType = 'object';
      }
      if (_.isArray(args[v])) {
        vType = 'array';
      }
      if (_.isNumber(args[v])) {
        vType = 'number';
      }
      return { ...s, ...{ [v]: vType } };
    }, {});
  }

  parser(args: ArgumentsNotStrictType = {}) {
    const params = Object.keys(args);
    return params.reduce((s, val) => {
      let newVal = _.get(args, val);

      if (this.argsTypes[val] === 'boolean') {
        if (['true', 'false'].includes(newVal)) {
          newVal = newVal === 'true';
        }
        if (!_.isBoolean(newVal)) {
          throw new Error(`Invalid argument type '${val}', '${this.argsTypes[val]}' required.`);
        }
        newVal = !!newVal;
      }

      if (this.argsTypes[val] === 'array') {
        if (_.isString(newVal)) {
          try {
            newVal = JSON.parse(newVal);
          } catch (error) {
            newVal = newVal.split(',').map((v) => v.trim());
          }
        } else if (!_.isArray(newVal)) {
          throw new Error(`Invalid argument type '${val}', '${this.argsTypes[val]}' required.`);
        }
      }

      if (this.argsTypes[val] === 'object') {
        if (_.isString(newVal)) {
          try {
            newVal = JSON.parse(newVal);
          } catch (error) {
            throw new Error(`Invalid argument type '${val}', '${this.argsTypes[val]}' required.`);
          }
        } else if (!_.isObject(newVal) || _.isArray(newVal)) {
          throw new Error(`Invalid argument type '${val}', '${this.argsTypes[val]}' required.`);
        }
      }

      if (this.argsTypes[val] === 'string') {
        if (!_.isString(newVal)) {
          throw new Error(`Invalid argument type '${val}', '${this.argsTypes[val]}' required.`);
        }
      }

      if (this.argsTypes[val] === 'number') {
        if (_.isString(newVal)) {
          newVal = parseInt(newVal, 10);
        }
        if (!_.isNumber(newVal) || _.isNaN(newVal)) {
          throw new Error(`Invalid argument type '${val}', '${this.argsTypes[val]}' required.`);
        }
      }

      const collector = { ...s, ...{ [val]: newVal } };
      return collector;
    }, {});
  }

  parseCLI() {
    const params = Object.keys(this.argsDefault);
    const argsRaw = process.argv
      .map((v: string) => v.split(/\s+/))
      .flat()
      .map((v: string) => v.split('='))
      .filter((v: string[]) => v.length > 1)
      .filter((v: string[]) => params.includes(v[0]));
    return this.parser(Object.fromEntries(argsRaw));
  }
}
