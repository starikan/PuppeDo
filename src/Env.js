const _ = require('lodash');

class Env {
  constructor(name, env = {}) {
    this.name = name;
    // Browser, pages, cookies, etc.
    this.state = {};
    this.env = {
      name,
      data: {},
      selectors: {},
    };
    this.env = { ...this.env, ...env };
  }

  set(name, data) {
    return _.set(this, name, data);
  }

  static setState() {
    // TODO: 2020-01-13 S.Starodubov cookies and other
  }

  get(name, def = null) {
    return _.get(this.env, name, def);
  }

  getState(value = null) {
    if (value) {
      return _.get(this, `state.${value}`);
    }
    return this.state;
  }

  push(name, data) {
    const arr = _.clone(this.get(name, []));
    try {
      arr.push(data);
    } catch (err) {
      /* eslint-disable no-console */
      console.log('class Env -> push');
      console.log(err);
      /* eslint-enable no-console */
    }
    return _.set(this.env, name, arr);
  }
}

module.exports = { Env };
