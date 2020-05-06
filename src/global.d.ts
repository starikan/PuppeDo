declare type ArgumentsType = {
  PPD_ROOT: string;
  PPD_ROOT_ADDITIONAL: string[];
  PPD_ROOT_IGNORE: string[];
  PPD_ENVS: string[];
  PPD_TESTS: string[];
  PPD_OUTPUT: string;
  PPD_DATA: Object;
  PPD_SELECTORS: Object;
  PPD_DEBUG_MODE: boolean;
  PPD_LOG_DISABLED: boolean;
  PPD_LOG_EXTEND: boolean;
  PPD_DISABLE_ENV_CHECK: boolean;
  PPD_LOG_LEVEL_NESTED: number;
  PPD_LOG_LEVEL_TYPE: string;
  PPD_LOG_LEVEL_TYPE_IGNORE: string[];
  PPD_LOG_SCREENSHOT: boolean;
  PPD_LOG_FULLPAGE: boolean;
};

declare type ArgumentsKeysType = keyof ArgumentsType;

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
  browser: {
    type: string;
    engine: string;
    runtime: string;
  };
  data?: Object;
  selectors?: Object;
};

declare type EnvStateType = {
  browser: any;
  pages: Object;
  pid?: any;
};
