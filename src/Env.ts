import get from 'lodash/get';

export default class Env {
  name: string;
  state: EnvStateType; // Browser, pages, cookies, etc.
  env: EnvType;

  constructor(name: string, env: EnvType) {
    this.name = name;
    this.state = {};
    this.env = env;
  }

  getState(value: keyof EnvStateType) {
    return get(this, `state.${value}`);
  }
}
