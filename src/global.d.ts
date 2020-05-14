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
  env: EnvYamlType;
};

declare type EnvStateType = {
  browser: any;
  pages: Object;
  pid?: any;
};

declare type TestJsonExtendType = {
  source: any;
  socket: any;
  stepId: string;
  breadcrumbs: string[];
  testFile: any;
  type: any;
};

declare type TestYamlType = {
  name: string;
  type?: 'atom' | 'test';
};

declare type EnvYamlType = {
  name: string;
  type: 'env';
  description?: string;
  data?: Object;
  selectors?: Object;
  dataExt?: Array<string>;
  selectorsExt?: Array<string>;
  envsExt?: Array<string>;
  browser?: {
    type?: 'browser' | 'electron';
    runtime?: 'run' | 'connect';
    engine?: 'puppeteer' | 'playwright';
    browserName?: 'chromium' | 'firefox' | 'webkit';
    args?: Array<string>;
    headless?: boolean;
    slowMo?: number;
    urlDevtoolsJson?: string;
    windowSize?: {
      width?: number;
      height?: number;
    };
    killOnEnd: boolean;
    runtimeEnv?: {
      runtimeExecutable?: string;
      program?: string;
      cwd?: string;
      args?: Array<string>;
      env?: Object;
      pauseAfterStartApp?: number;
    };
  };
  log?: {
    level?: string;
    screenshot?: boolean;
    fullpage?: boolean;
  };
};

declare type DataYamlType = {
  name: string;
  type: 'data' | 'selectors';
  data: Object;
};

declare type ColorsMainType = {
  sane: number;
  black: number;
  red: number;
  green: number;
  yellow: number;
  blue: number;
  magenta: number;
  cyan: number;
  white: number;
};

declare type ColorsExtendType = {
  raw: number;
  timer: number;
  debug: number;
  info: number;
  test: number;
  warn: number;
  error: number;
  trace: number;
  env: number;
};
