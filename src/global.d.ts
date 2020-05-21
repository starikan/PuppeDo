type ArgumentsType = {
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

type ArgumentsKeysType = keyof ArgumentsType;

type SocketType = {
  send: Function;
  sendYAML: Function;
};

// ================ ENVS ====================

type EnvStateType = {
  browser: any;
  pages: Object;
  pid?: any;
};

type EnvBrowserType = {
  type?: 'browser' | 'electron' | 'api';
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
  killOnEnd?: boolean;
  runtimeEnv?: {
    runtimeExecutable?: string;
    program?: string;
    cwd?: string;
    args?: Array<string>;
    env?: { [key: string]: string };
    pauseAfterStartApp?: number;
  };
};

type EnvYamlType = {
  name: string;
  type: 'env';
  description?: string;
  data?: Object;
  selectors?: Object;
  dataExt?: Array<string>;
  selectorsExt?: Array<string>;
  envsExt?: Array<string>;
  browser?: EnvBrowserType;
  log?: {
    level?: string;
    screenshot?: boolean;
    fullpage?: boolean;
  };
};

interface EnvType extends EnvYamlType {
  testFile: string;
}

// ================ DATA / SELECTORS ====================

type DataYamlType = {
  name: string;
  type: 'data' | 'selectors';
  data: Object;
};

interface DataType extends DataYamlType {
  testFile: string;
}

// ================ TESTS / ATOMS ====================

type TestJsonExtendType = {
  source: any;
  socket: any;
  stepId: string;
  breadcrumbs: string[];
  testFile: any;
  type: any;
};

type TestYamlType = {
  name: string;
  type?: 'atom' | 'test';
};

interface TestType extends TestYamlType {
  testFile: string;
}
