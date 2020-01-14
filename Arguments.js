const _ = require('lodash');
require('polyfill-object.fromentries');
require('array-flat-polyfill');

const { merge } = require('./helpers');

const { Singleton } = require('./singleton');

class Arguments extends Singleton {
  constructor(args, reInit = false) {
    super();
    if (reInit || !this.args) {
      return this.init(args);
    }
    return this.args;
  }

  init(args) {
    this.argsDefault = {
      PPD_ROOT: process.cwd(),
      PPD_ROOT_ADDITIONAL: [],
      PPD_ROOT_IGNORE: ['.git', 'node_modules', '.history'],
      PPD_ENVS: [],
      PPD_TESTS: [],
      PPD_OUTPUT: 'output',
      PPD_DATA: {},
      PPD_SELECTORS: {},
      PPD_DEBUG_MODE: false,
      PPD_LOG_DISABLED: false,
      PPD_LOG_TIMER: false,
      PPD_DISABLE_ENV_CHECK: false,
    };
    this.params = Object.keys(this.argsDefault);
    this.argsJS = this.parser(args, this.params);
    this.argsEnv = this.parser(_.pick(process.env, this.params), this.params);
    this.argsCLI = this.parseCLI(this.params);
    this.args = this.mergeArgs();
    return this.args;
  }

  parser(args, params) {
    return params.reduce((s, val) => {
      let newVal = _.get(args, val);
      // If comma in string try convert to array
      if (_.isString(newVal)) {
        try {
          newVal = JSON.parse(newVal);
        }
        catch (error) {
          newVal = newVal.split(',').map(v => v.trim());
          newVal = newVal.length === 1 ? newVal[0] : newVal;
        }
      }
      // Convert string to Boolean
      if (['true', 'false'].includes(newVal)) {
        newVal = newVal === 'true' ? true : false;
      }
      if (newVal) {
        s[val] = newVal;
      }
      return s;
    }, {});
  }

  parseCLI(params) {
    const argsRaw = process.argv
      .map(v => v.split(/\s+/))
      .flat()
      .map(v => v.split('='))
      .filter(v => v.length > 1)
      .filter(v => params.includes(v[0]));
    return this.parser(Object.fromEntries(argsRaw), params);
  }

  mergeArgs() {
    this.args = merge(this.argsDefault, this.argsEnv, this.argsCLI, this.argsJS);

    if (!this.args.PPD_TESTS || _.isEmpty(this.args.PPD_TESTS)) {
      throw { message: 'There is no tests to run. Pass any test in PPD_TESTS argument' };
    }

    if (!this.args.PPD_ENVS || _.isEmpty(this.args.PPD_ENVS)) {
      throw { message: 'There is no environments to run. Pass any test in PPD_ENVS argument' };
    }

    this.args.PPD_TESTS = !_.isArray(this.args.PPD_TESTS) ? [this.args.PPD_TESTS] : this.args.PPD_TESTS;
    this.args.PPD_ENVS = !_.isArray(this.args.PPD_ENVS) ? [this.args.PPD_ENVS] : this.args.PPD_ENVS;
    this.args.PPD_ROOT_IGNORE = !_.isArray(this.args.PPD_ROOT_IGNORE)
      ? [this.args.PPD_ROOT_IGNORE]
      : this.args.PPD_ROOT_IGNORE;

    return this.args;
  }
}

module.exports = {
  Arguments,
};
