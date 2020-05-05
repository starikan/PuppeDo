declare type SocketType = {
  send: Function;
  sendYAML: Function;
};

declare type EnvType = {
  name: string;
  data?: Object;
  selectors?: Object;
};
