declare type SocketType = {
  send: Function;
  sendYAML: Function;
};

type EnvsPoolType = {
  name: string;
  state: EnvStateType;
  env: EnvType;
};

declare type EnvType = {
  name: string;
  data?: Object;
  selectors?: Object;
};

declare type EnvStateType = {
  browser: any;
  pages: Object;
  pid?: any;
};
