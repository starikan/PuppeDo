export default class Env implements EnvsPoolType {
  name: string;
  state: EnvStateType; // Browser, pages, cookies, etc.
  env: EnvYamlType;

  constructor(env: EnvYamlType) {
    this.name = env.name || 'BlankEnv';
    this.state = {
      browser: null,
      pages: {},
    };
    this.env = env;
  }
}
