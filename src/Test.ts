import vm from 'vm';

import { merge, blankSocket, getTimer, pick } from './Helpers';
import Blocker from './Blocker';
import { Arguments } from './Arguments';
import Environment from './Environment';
import TestsContent from './TestContent';
import { TestError } from './Error';

import {
  LogOptionsType,
  EnvsPoolType,
  ColorsType,
  SocketType,
  InputsTestType,
  TestArgsType,
  TestArgsExtType,
  EnvType,
  EnvStateType,
  LogFunctionType,
  TestLifecycleFunctionType,
} from './global.d';

const ALIASES = {
  data: ['d', '📋'],
  bindData: [
    'bD',
    'bd',
    '📌📋',
    'dataBind',
    'db',
    'dB',
    'dataFunction',
    'dF',
    'df',
    '🔑📋',
    'functionData',
    'fd',
    'fD',
  ],
  selectors: ['selector', 's', '💠'],
  bindSelectors: [
    'bindSelector',
    'bS',
    'bs',
    '📌💠',
    'selectorBind',
    'selectorsBind',
    'sb',
    'sB',
    'selectorsFunction',
    'selectorFunction',
    'sF',
    'sf',
    '🔑💠',
    'functionSelector',
    'functionSelectors',
    'fs',
    'fS',
  ],
  bindResults: [
    'bindResult',
    'bR',
    'br',
    'result',
    'r',
    '↩️',
    'R',
    'rb',
    'rB',
    'resultBind',
    'resultsBind',
    'rF',
    'rf',
    '🔑↩️',
    'functionResult',
    'fr',
    'fR',
    'resultFunction',
    'values',
    'value',
    'v',
    'var',
    'vars',
    'const',
    'c',
    'let',
    'set',
  ],
  options: ['option', 'opt', 'o', '⚙️'],
};

const runScriptInContext = (source: string, context: Record<string, unknown>): unknown => {
  let result: unknown;

  if (source === '{}') {
    return {};
  }

  try {
    const script = new vm.Script(source);
    vm.createContext(context);
    result = script.runInContext(context);
  } catch (error) {
    throw new Error(`Can't evaluate ${source} = '${error.message}'`);
  }

  return result;
};

const checkNeeds = (needs: Array<string>, data: Record<string, unknown>, testName: string): boolean => {
  // [['data', 'd'], 'another', 'optional?']
  const keysData = new Set(Object.keys(data));
  needs.forEach((d) => {
    if (typeof d === 'string' && d.endsWith('?')) return; // optional parameter
    const keysDataIncome = new Set(typeof d === 'string' ? [d] : d);
    const intersectionData = new Set([...keysData].filter((x) => keysDataIncome.has(x)));
    if (!intersectionData.size) {
      throw new Error(`Error: can't find data parameter "${d}" in ${testName} test`);
    }
  });
  return true;
};

const resolveDataFunctions = (
  funcParams: Record<string, string>,
  allData: Record<string, unknown>,
): Record<string, unknown> => {
  const funcEval = Object.entries(funcParams).reduce((s, v) => {
    const [key, data] = v;
    const evalData = runScriptInContext(data, allData);
    const collector = { ...s, ...{ [key]: evalData } };
    return collector;
  }, {});
  return funcEval;
};

const resolveAliases = (valueName: string, inputs = {}): Record<string, unknown> => {
  try {
    const values = [valueName, ...(ALIASES[valueName] || [])];
    const result = values.reduce(
      (collector: Record<string, unknown>, name: string) => ({ ...collector, ...(inputs[name] || {}) }),
      {},
    );
    return result;
  } catch (error) {
    error.message += ` || function resolveAliases(${valueName})`;
    throw error;
  }
};

const checkNeedEnv = (needEnv: string | string[], envName: string): void => {
  const needEnvs = typeof needEnv === 'string' ? [needEnv] : needEnv;
  if (Array.isArray(needEnvs)) {
    if (needEnvs.length && !needEnvs.includes(envName)) {
      throw new Error(`Wrong Environment, local current env = ${envName}, but test pass needEnvs = ${needEnvs}`);
    }
  } else {
    throw new Error('needEnv wrong format, should be array or string');
  }
};

export const checkIf = async (
  expr: string,
  ifType: 'if' | 'errorIf' | 'errorIfResult',
  log: LogFunctionType,
  levelIndent = 0,
  allData: Record<string, unknown> = {},
): Promise<boolean> => {
  const exprResult = runScriptInContext(expr, allData);

  if (!exprResult && ifType === 'if') {
    await log({
      level: 'info',
      screenshot: false,
      fullpage: false,
      levelIndent,
      text: `Skipping with expr '${expr}'`,
    });
    return true;
  }

  if (exprResult && ifType !== 'if') {
    await log({
      level: 'error',
      levelIndent,
      screenshot: true,
      fullpage: true,
      text: `Test stopped with expr ${ifType} = '${expr}'`,
    });
    throw new Error(`Test stopped with expr ${ifType} = '${expr}'`);
  }

  return false;
};

const updateDataWithNeeds = (
  needData: string[],
  needSelectors: string[],
  dataLocal: Record<string, unknown>,
  selectorsLocal: Record<string, unknown>,
): { dataLocal: Record<string, unknown>; selectorsLocal: Record<string, unknown> } => {
  const allData = merge(selectorsLocal, dataLocal);

  const dataLocalCopy = JSON.parse(JSON.stringify(dataLocal));
  const selectorsLocalCopy = JSON.parse(JSON.stringify(selectorsLocal));

  needData
    .map((v: string) => v.replace('?', ''))
    .forEach((v: string) => {
      dataLocalCopy[v] = typeof allData[v] !== 'undefined' ? allData[v] : null;
      selectorsLocalCopy[v] = typeof allData[v] !== 'undefined' ? allData[v] : null;
    });

  needSelectors
    .map((v: string) => v.replace('?', ''))
    .forEach((v: string) => {
      dataLocalCopy[v] = typeof allData[v] !== 'undefined' ? allData[v] : null;
      selectorsLocalCopy[v] = typeof allData[v] !== 'undefined' ? allData[v] : null;
    });

  return {
    dataLocal: dataLocalCopy,
    selectorsLocal: selectorsLocalCopy,
  };
};

const resolveLogOptions = (
  logOptionsParent: LogOptionsType,
  logOptions: LogOptionsType,
  envsPool: EnvsPoolType,
): { logShowFlag: boolean; logForChild: LogOptionsType; logOptionsNew: LogOptionsType } => {
  const { PPD_LOG_IGNORE_HIDE_LOG } = new Arguments().args;
  const { logThis: logThisParent = true, logChildren: logChildrenParent = true } = logOptionsParent;

  const logOptionsNew = {
    textColor: 'sane' as ColorsType,
    backgroundColor: 'sane' as ColorsType,
    output: envsPool.output,
    ...logOptions,
  };

  const logForChild: LogOptionsType = merge({ logChildren: logChildrenParent }, logOptionsNew, {
    logThis: logThisParent,
  });

  let logShowFlag = true;

  if (logChildrenParent === false) {
    logShowFlag = false;
  }

  if (typeof logOptions.logThis === 'boolean') {
    logShowFlag = logOptions.logThis;
  }

  if (PPD_LOG_IGNORE_HIDE_LOG) {
    logForChild.logThis = true;
    logForChild.logChildren = true;
    logShowFlag = true;
  }

  return { logShowFlag, logForChild, logOptionsNew };
};

const fetchData = (
  dataExt: Array<string>,
  selectorsExt: Array<string>,
  resultsFromParent: Record<string, unknown>,
  dataParent: Record<string, unknown>,
  data: Record<string, unknown>,
  bindData: Record<string, string>,
  selectorsParent: Record<string, unknown>,
  selectors: Record<string, unknown>,
  bindSelectors: Record<string, string>,
  env: {
    name: string;
    state: EnvStateType; // Browser, pages, cookies, etc.
    env: EnvType;
  },
): { dataLocal: Record<string, unknown>; selectorsLocal: Record<string, unknown> } => {
  const { PPD_DATA, PPD_SELECTORS } = new Arguments().args;
  const { data: allData, selectors: allSelectors } = new TestsContent().allData;

  const dataExtResolved = dataExt.reduce((collect, v) => {
    const extData = allData.find((d) => v === d.name);
    return { ...collect, ...extData };
  }, {});
  const selectorsExtResolved = selectorsExt.reduce((collect, v) => {
    const extData = allSelectors.find((d) => v === d.name);
    return { ...collect, ...extData };
  }, {});

  const dataFlow = [PPD_DATA, env?.env?.data || {}, dataExtResolved, dataParent, resultsFromParent, data];
  let dataLocal = merge(...dataFlow);

  const selectorsFlow = [
    PPD_SELECTORS,
    env?.env?.selectors || {},
    selectorsExtResolved,
    selectorsParent,
    resultsFromParent,
    selectors,
  ];
  let selectorsLocal = merge(...selectorsFlow);

  Object.entries(bindData).forEach((v: [string, string]) => {
    const [key, val] = v;
    dataLocal = { ...dataLocal, ...resolveDataFunctions({ [key]: val }, dataLocal) };
  });

  Object.entries(bindSelectors).forEach((v: [string, string]) => {
    const [key, val] = v;
    selectorsLocal = { ...selectorsLocal, ...resolveDataFunctions({ [key]: val }, selectorsLocal) };
  });

  return { dataLocal, selectorsLocal };
};

const getLogText = (text: string, nameTest = '', PPD_LOG_TEST_NAME = false): string => {
  const nameTestResolved = nameTest && (PPD_LOG_TEST_NAME || !text) ? `(${nameTest}) ` : '';
  const descriptionTest = text || 'TODO: Fill description';
  return `${nameTestResolved}${descriptionTest}`;
};

export class Test {
  name: string;
  type: string;
  needEnv: Array<string>;
  needData: Array<string>;
  needSelectors: Array<string>;
  dataParent: Record<string, unknown>;
  selectorsParent: Record<string, unknown>;
  options: Record<string, unknown>;
  dataExt: Array<string>;
  selectorsExt: Array<string>;
  allowResults: Array<string>;
  beforeTest: TestLifecycleFunctionType | TestLifecycleFunctionType[];
  runTest: TestLifecycleFunctionType | TestLifecycleFunctionType[];
  afterTest: TestLifecycleFunctionType | TestLifecycleFunctionType[];
  levelIndent: number;
  repeat: number;
  source: Record<string, unknown>;
  socket: SocketType;
  stepId: string;
  breadcrumbs: Array<string>;
  funcFile: string;
  testFile: string;
  debug: boolean;
  disable: boolean;
  logOptions: LogOptionsType;
  frame: string;
  data: Record<string, unknown>;
  bindData: Record<string, string>;
  selectors: Record<string, unknown>;
  bindSelectors: Record<string, string>;
  bindResults: Record<string, string>;
  description: string;
  descriptionExtend: string[];
  descriptionError: string;
  bindDescription: string;
  while: string;
  if: string;
  errorIf: string;
  errorIfResult: string;
  resultsFromChildren: Record<string, unknown>;
  resultsFromParent: Record<string, unknown>;
  tags: string[];

  envName: string;
  envPageName: string;
  env: {
    name: string;
    state: EnvStateType; // Browser, pages, cookies, etc.
    env: EnvType;
  };

  runLogic: (envsId: string, inputs: InputsTestType) => Promise<Record<string, unknown>>;
  run: (envsId: string, inputArgs: InputsTestType) => Promise<Record<string, unknown>>;

  constructor({
    name = null,
    type = 'test',
    levelIndent = 0,
    needEnv = [],
    needData = [],
    needSelectors = [],
    allowResults = [],
    data = {},
    selectors = {},
    options = {},
    dataExt = [],
    selectorsExt = [],
    description = '',
    descriptionExtend = [],
    descriptionError = '',
    bindDescription = '',
    beforeTest = async (): Promise<void> => {
      // Do nothing
    },
    runTest = async (): Promise<void> => {
      // Do nothing
    },
    afterTest = async (): Promise<void> => {
      // Do nothing
    },
    source = {},
    repeat = 1,
    socket = blankSocket,
    stepId = null,
    breadcrumbs = [],
    funcFile = null,
    testFile = null,
    debug = false,
    disable = false,
    logOptions = {},
    frame = '',
    tags = [],
  } = {}) {
    this.name = name;
    this.type = type;
    this.needEnv = needEnv;
    this.needData = needData;
    this.needSelectors = needSelectors;
    this.data = data;
    this.selectors = selectors;
    this.options = options;
    this.dataExt = dataExt;
    this.selectorsExt = selectorsExt;
    this.allowResults = allowResults;
    this.description = description;
    this.descriptionExtend = descriptionExtend;
    this.descriptionError = descriptionError;
    this.bindDescription = bindDescription;
    this.beforeTest = beforeTest;
    this.runTest = runTest;
    this.afterTest = afterTest;
    this.levelIndent = levelIndent;
    this.repeat = repeat;
    this.source = source;
    this.socket = socket;
    this.stepId = stepId;
    this.breadcrumbs = breadcrumbs;
    this.funcFile = funcFile;
    this.testFile = testFile;
    this.debug = debug;
    this.disable = disable;
    this.logOptions = logOptions;
    this.frame = frame;
    this.tags = tags;

    this.runLogic = async (envsId: string, inputs: InputsTestType = {}): Promise<Record<string, unknown>> => {
      const startTime = getTimer().now;
      const { envsPool, logger } = Environment(envsId);
      const { logShowFlag, logForChild, logOptionsNew } = resolveLogOptions(
        inputs.logOptionsParent,
        this.logOptions,
        envsPool,
      );

      const {
        PPD_DEBUG_MODE,
        PPD_DISABLE_ENV_CHECK,
        PPD_LOG_EXTEND,
        PPD_LOG_TEST_NAME,
        PPD_TAGS_TO_RUN,
      } = new Arguments().args;
      this.debug = PPD_DEBUG_MODE && ((this.type === 'atom' && inputs.debug) || this.debug);

      if (this.debug) {
        // eslint-disable-next-line no-debugger
        debugger;
      }

      if (this.disable) {
        await logger.log({
          text: `Skip with disable => ${getLogText(this.description, this.name, PPD_LOG_TEST_NAME)}`,
          level: 'raw',
          levelIndent,
          logShowFlag,
          textColor: 'blue',
        });
        return {};
      }

      if (this.tags.length && !this.tags.filter((v) => PPD_TAGS_TO_RUN.includes(v)).length) {
        await logger.log({
          text: `Skip with tags: ${JSON.stringify(this.tags)} => ${getLogText(
            this.description,
            this.name,
            PPD_LOG_TEST_NAME,
          )}`,
          level: 'raw',
          levelIndent,
          logShowFlag,
          textColor: 'blue',
        });
        return {};
      }

      // Get Data from parent test and merge it with current test
      this.data = resolveAliases('data', inputs);
      this.dataParent = merge(this.dataParent || {}, inputs.dataParent);
      this.bindData = resolveAliases('bindData', inputs) as Record<string, string>;
      this.dataExt = [...new Set([...this.dataExt, ...(inputs.dataExt || [])])];

      this.selectors = resolveAliases('selectors', inputs);
      this.selectorsParent = merge(this.selectorsParent || {}, inputs.selectorsParent);
      this.bindSelectors = resolveAliases('bindSelectors', inputs) as Record<string, string>;
      this.selectorsExt = [...new Set([...this.selectorsExt, ...(inputs.selectorsExt || [])])];

      this.bindResults = resolveAliases('bindResults', inputs) as Record<string, string>;
      this.resultsFromParent = inputs.resultsFromParent;

      this.options = merge(this.options, resolveAliases('options', inputs), inputs.optionsParent);
      this.description = inputs.description || this.description;
      this.descriptionExtend = inputs.descriptionExtend || this.descriptionExtend || [];
      this.bindDescription = inputs.bindDescription || this.bindDescription;
      this.repeat = inputs.repeat || this.repeat;
      this.while = inputs.while || this.while;
      this.if = inputs.if || this.if;
      this.errorIf = inputs.errorIf || this.errorIf;
      this.errorIfResult = inputs.errorIfResult || this.errorIfResult;
      this.frame = this.frame || inputs.frame;
      this.logOptions = logOptionsNew;

      try {
        this.envName = envsPool.current.name;
        this.envPageName = envsPool.current.page;
        this.env = envsPool.envs[this.envName];

        if (!PPD_DISABLE_ENV_CHECK) {
          checkNeedEnv(this.needEnv, this.envName);
        }

        let { dataLocal, selectorsLocal } = fetchData(
          this.dataExt,
          this.selectorsExt,
          this.resultsFromParent,
          this.dataParent,
          this.data,
          this.bindData,
          this.selectorsParent,
          this.selectors,
          this.bindSelectors,
          this.env,
        );

        checkNeeds(needData, dataLocal, this.name);
        checkNeeds(needSelectors, selectorsLocal, this.name);

        ({ dataLocal, selectorsLocal } = updateDataWithNeeds(needData, needSelectors, dataLocal, selectorsLocal));

        const allData = merge(selectorsLocal, dataLocal);

        if (this.bindDescription) {
          this.description = this.description || String(runScriptInContext(this.bindDescription, allData));
        }
        if (!this.description) {
          this.logOptions.backgroundColor = 'red';
        }

        this.repeat = parseInt(runScriptInContext(String(this.repeat), allData) as string, 10);

        // All data passed to log
        const args: TestArgsType = {
          envsId,
          data: dataLocal,
          selectors: selectorsLocal,
          dataTest: this.data,
          selectorsTest: this.selectors,
          envName: this.envName,
          envPageName: this.envPageName,
          options: this.options,
          allowResults: this.allowResults,
          bindResults: this.bindResults,
          bindSelectors: this.bindSelectors,
          bindData: this.bindData,
          bindDescription: this.bindDescription,
          levelIndent: this.levelIndent,
          repeat: this.repeat,
          stepId: this.stepId,
          debug: this.debug,
          logOptions: logForChild,
          frame: this.frame,
          tags: this.tags,
        };

        // IF
        if (this.if) {
          const skipIf = await checkIf(this.if, 'if', logger.log.bind(logger), this.levelIndent + 1, allData);
          if (skipIf) {
            return {};
          }
        }

        // ERROR IF
        if (this.errorIf) {
          await checkIf(this.errorIf, 'errorIf', logger.log.bind(logger), this.levelIndent + 1, allData);
        }

        // LOG TEST
        logger.bindData({ testSource: source, bindedData: args });

        await logger.log({
          text: getLogText(this.description, this.name, PPD_LOG_TEST_NAME),
          level: 'test',
          levelIndent,
          logShowFlag,
          textColor: this.logOptions.textColor,
          backgroundColor: this.logOptions.backgroundColor,
        });

        for (let step = 0; step < this.descriptionExtend.length; step += 1) {
          await logger.log({
            text: `${step + 1}. => ${getLogText(this.descriptionExtend[step])}`,
            level: 'env',
            levelIndent,
            logShowFlag,
          });
        }

        // Extend with data passed to functions
        const pageCurrent = this.env && this.env.state?.pages && this.env.state?.pages[this.envPageName];
        const argsExt: TestArgsExtType = {
          ...args,
          env: this.env,
          envs: envsPool,
          browser: this.env && this.env.state.browser,
          page: pageCurrent || null, // If there is no page it`s might be API
          log: logger.log.bind(logger),
          name: this.name,
          description: this.description,
          socket: this.socket,
        };

        // RUN FUNCTIONS
        const FUNCTIONS = [this.beforeTest, this.runTest, this.afterTest];
        let resultFromTest = {};

        for (let i = 0; i < FUNCTIONS.length; i += 1) {
          let funcs = FUNCTIONS[i];

          if (typeof funcs === 'function') {
            funcs = [funcs];
          }
          if (Array.isArray(funcs)) {
            for (let f = 0; f < funcs.length; f += 1) {
              const fun = funcs[f];
              const funResult = (await fun(argsExt)) || {};
              resultFromTest = merge(resultFromTest, funResult);
            }
          }
        }

        // RESULTS
        const results = this.allowResults.length ? pick(resultFromTest, this.allowResults) : resultFromTest;
        if (
          this.allowResults.length &&
          Object.keys(results).length &&
          Object.keys(results).length !== [...new Set(this.allowResults)].length
        ) {
          throw new Error('Can`t get results from test');
        }
        const allowResultsObject = this.allowResults.reduce((collect, v) => ({ ...collect, ...{ [v]: v } }), {});
        let localResults = resolveDataFunctions(
          { ...this.bindResults, ...allowResultsObject },
          merge(selectorsLocal, dataLocal, results),
        );

        // ERROR
        if (this.errorIfResult) {
          await checkIf(this.errorIfResult, 'errorIfResult', logger.log.bind(logger), this.levelIndent + 1, {
            ...allData,
            ...localResults,
          });
        }

        // WHILE
        if (this.while) {
          const whileEval = runScriptInContext(this.while, { ...allData, ...localResults });
          if (whileEval) {
            this.repeat += 1;
          }
        }

        // REPEAT
        if (this.repeat > 1) {
          const repeatArgs = JSON.parse(JSON.stringify(inputs));
          repeatArgs.selectors = { ...repeatArgs.selectors, ...localResults };
          repeatArgs.data = { ...repeatArgs.data, ...localResults };
          repeatArgs.repeat = this.repeat - 1;
          const repeatResult = await this.run(envsId, repeatArgs);
          localResults = { ...localResults, ...repeatResult };
        }

        // TIMER IN CONSOLE
        if (PPD_LOG_EXTEND) {
          await logger.log({
            text: `🕝: ${getTimer(startTime).delta} s. (${this.name})`,
            level: 'timer',
            levelIndent,
            extendInfo: true,
          });
        }

        // eslint-disable-next-line consistent-return
        return localResults;
      } catch (error) {
        const newError = new TestError({ logger, parentError: error, test: this, envsId });
        await newError.log();
        throw newError;
      }
    };

    this.run = async (envsId: string, inputArgs: InputsTestType = {}): Promise<Record<string, unknown>> => {
      const blocker = new Blocker();
      const block = blocker.getBlock(this.stepId);
      const { blockEmitter } = blocker;
      if (block && blockEmitter) {
        // Test
        // setTimeout(() => {
        //   blocker.setBlock(this.stepId, false);
        // }, 2000);
        return new Promise((resolve) => {
          blockEmitter.on('updateBlock', async (newBlock) => {
            if (newBlock.stepId === this.stepId && !newBlock.block) {
              await this.runLogic(envsId, inputArgs);
              resolve();
            }
          });
        });
      }
      return this.runLogic(envsId, inputArgs);
    };
  }
}
