const _ = require('lodash');
require('polyfill-object.fromentries');

const { merge } = require('./helpers');

const { Singleton } = require('./singleton');

class Arguments extends Singleton {
  constructor() {
    super();
  }

  // TODO добавить дополнительные папки с тестами чтобы сделать атомы пакетом нпм

  init(args) {
    this.argsDefault = {
      PPD_ROOT: process.cwd(),
      // TODO
      PPD_ROOT_ADDITIONAL: [],
      PPD_ENVS: [],
      PPD_TESTS: [],
      PPD_OUTPUT: 'output',
      PPD_DATA: {},
      PPD_SELECTORS: {},
      PPD_DEBUG_MODE: false,
      PPD_LOG_DISABLED: false,
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
        newVal = newVal.split(',');
        if (newVal.length === 1) {
          newVal = newVal[0];
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

    return this.args;
  }
}

module.exports = {
  Arguments,
};