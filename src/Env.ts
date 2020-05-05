export default class Env implements EnvsPoolType {
  name: string;
  state: EnvStateType; // Browser, pages, cookies, etc.
  env: EnvType;

  constructor(name: string, env: EnvType) {
    this.name = name;
    this.state = {
      browser: null,
      pages: {},
    };
    this.env = env;
  }
}
