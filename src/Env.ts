import { get, clone, set } from 'lodash';

export default class Env {
  name: any;
  state: any;
  env: any;

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
    return set(this, name, data);
  }

  static setState() {
    // TODO: 2020-01-13 S.Starodubov cookies and other
  }

  get(name, def = null) {
    return get(this.env, name, def);
  }

  getState(value = null) {
    if (value) {
      return get(this, `state.${value}`);
    }
    return this.state;
  }

  push(name, data) {
    const arr = clone(this.get(name, []));
    try {
      arr.push(data);
    } catch (err) {
      /* eslint-disable no-console */
      console.log('class Env -> push');
      console.log(err);
      /* eslint-enable no-console */
    }
    return set(this.env, name, arr);
  }
}
