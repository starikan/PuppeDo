import vm from 'vm';

import { blankSocket, getTimer, merge, pick, getStepId } from './Helpers';
import Blocker from './Blocker';
import { Arguments } from './Arguments';
import Environment from './Environment';
import TestsContent from './TestContent';
import { ContinueParentError, TestError } from './Error';
import { logDebug } from './Log';
import globalExportPPD from './index';

import {
  LogOptionsType,
  EnvsPoolType,
  ColorsType,
  SocketType,
  TestArgsType,
  TestArgsExtType,
  EnvType,
  EnvStateType,
  LogFunctionType,
  TestLifecycleFunctionType,
  BrowserEngineType,
  TestExtendType,
  ArgumentsType,
  TestMetaSublingExchangeData,
} from './global.d';
import Atom from './AtomCore';

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
    'results',
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

export const runScriptInContext = (
  source: string,
  context: Record<string, unknown>,
  defaultValue: unknown = null,
): unknown => {
  let result: unknown;

  if (source === '{}') {
    return {};
  }

  try {
    const script = new vm.Script(source);
    vm.createContext(context);
    result = script.runInContext(context);
  } catch (error) {
    if (defaultValue !== null && defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Can't evaluate ${source} = '${error.message}'`);
  }

  return result;
};

const checkNeeds = (needs: string[], data: Record<string, unknown>, testName: string): boolean => {
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
    let evalData: unknown = data;
    try {
      evalData = runScriptInContext(data, allData);
    } catch (error) {
      // Nothing to do
    }
    const collector = { ...s, ...{ [key]: evalData } };
    return collector;
  }, {});
  return funcEval;
};

const resolveAliases = (alias: keyof typeof ALIASES, inputs: TestExtendType): Record<string, unknown> => {
  const variants = [...(ALIASES[alias] || []), alias];
  const values = (Object.values(pick(inputs, variants)) as Record<string, unknown>[]).map((v) => v || {});
  const result = merge(...values);
  return result;
};

// TODO: 2021-12-07 S.Starodubov move to class and improve with ${getLogText(text, this.name, PPD_LOG_TEST_NAME)}
export const checkIf = async (
  expr: string,
  ifType: 'if' | 'errorIf' | 'errorIfResult',
  log: LogFunctionType,
  levelIndent = 0,
  allData: Record<string, unknown> = {},
  logShowFlag = true,
  continueOnError = false,
): Promise<boolean> => {
  const exprResult = runScriptInContext(expr, allData);

  if (!exprResult && ifType === 'if') {
    if (logShowFlag && !continueOnError) {
      await log({
        level: 'info',
        screenshot: false,
        fullpage: false,
        levelIndent,
        text: `Skip with IF expr '${expr}' === '${exprResult}'`,
      });
    }
    return true;
  }

  if (exprResult && ifType !== 'if') {
    if (!continueOnError) {
      await log({
        level: 'error',
        levelIndent,
        screenshot: true,
        fullpage: true,
        text: `Test stopped with expr ${ifType} = '${expr}'`,
      });
    }
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
  const allData = { ...selectorsLocal, ...dataLocal };
  const dataLocalCopy = { ...dataLocal };
  const selectorsLocalCopy = { ...selectorsLocal };

  [...needData, ...needSelectors]
    .map((v: string) => v.replace('?', ''))
    .forEach((v: string) => {
      dataLocalCopy[v] = typeof allData[v] !== 'undefined' ? allData[v] : null;
      selectorsLocalCopy[v] = typeof allData[v] !== 'undefined' ? allData[v] : null;
    });

  return { dataLocal: dataLocalCopy, selectorsLocal: selectorsLocalCopy };
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

  const logForChild: LogOptionsType = {
    ...{ logChildren: logChildrenParent },
    ...logOptionsNew,
    ...{ logThis: logThisParent },
  };

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
  dataExt: string[],
  selectorsExt: string[],
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
    return extData ? { ...collect, ...extData.data } : collect;
  }, {});
  const selectorsExtResolved = selectorsExt.reduce((collect, v) => {
    const extData = allSelectors.find((d) => v === d.name);
    return extData ? { ...collect, ...extData.data } : collect;
  }, {});

  let dataLocal = {
    ...PPD_DATA,
    ...(env?.env?.data || {}),
    ...dataExtResolved,
    ...dataParent,
    ...(resultsFromParent || {}),
    ...data,
  };

  let selectorsLocal = {
    ...PPD_SELECTORS,
    ...(env?.env?.selectors || {}),
    ...selectorsExtResolved,
    ...selectorsParent,
    ...(resultsFromParent || {}),
    ...selectors,
  };

  const allDataLocal = { ...dataLocal, ...selectorsLocal };
  Object.entries(bindData).forEach((v: [string, string]) => {
    const [key, val] = v;
    dataLocal = { ...dataLocal, ...resolveDataFunctions({ [key]: val }, allDataLocal) };
  });

  Object.entries(bindSelectors).forEach((v: [string, string]) => {
    const [key, val] = v;
    selectorsLocal = { ...selectorsLocal, ...resolveDataFunctions({ [key]: val }, allDataLocal) };
  });

  return { dataLocal, selectorsLocal };
};

const getLogText = (text: string, nameTest = '', PPD_LOG_TEST_NAME = false): string => {
  const nameTestResolved = nameTest && (PPD_LOG_TEST_NAME || !text) ? `(${nameTest}) ` : '';
  const descriptionTest = text || 'TODO: Fill description';
  return `${nameTestResolved}${descriptionTest}`;
};

const checkIntersection = (dataLocal: Record<string, unknown>, selectorsLocal: Record<string, unknown>): void => {
  const intersectionKeys = Object.keys(dataLocal).filter((v) => Object.keys(selectorsLocal).includes(v));
  if (intersectionKeys.length) {
    intersectionKeys.forEach((v) => {
      if (!Number.isNaN(dataLocal[v]) && !Number.isNaN(selectorsLocal[v]) && dataLocal[v] !== selectorsLocal[v]) {
        throw new Error(`Some keys in data and selectors intersect. It can corrupt data: '${v}'`);
      }
    });
  }
};

export class Test implements TestExtendType {
  name: string;
  envsId: string;
  type: 'atom' | 'test';
  needData: string[];
  needSelectors: string[];
  needEnvParams: string[];
  dataParent!: Record<string, unknown>;
  selectorsParent!: Record<string, unknown>;
  options: Record<string, string | number>;
  dataExt: string[];
  selectorsExt: string[];
  allowResults: string[];
  beforeTest: TestLifecycleFunctionType[];
  runTest: TestLifecycleFunctionType[];
  afterTest: TestLifecycleFunctionType[];
  levelIndent: number;
  repeat: number;
  source: string;
  socket: SocketType;
  stepId: string;
  breadcrumbs: string[];
  breadcrumbsDescriptions: string[];
  funcFile: string;
  testFile: string;
  debug: boolean;
  debugInfo: boolean | 'data' | 'selectors';
  disable: boolean;
  logOptions: LogOptionsType;
  frame: string;
  data: Record<string, unknown>;
  bindData!: Record<string, string>;
  selectors: Record<string, unknown>;
  bindSelectors!: Record<string, string>;
  bindResults!: Record<string, string>;
  description: string;
  descriptionExtend: string[];
  descriptionError: string;
  bindDescription: string;
  while!: string;
  if!: string;
  errorIf!: string;
  errorIfResult!: string;
  resultsFromPrevSubling!: Record<string, unknown>;
  metaFromPrevSubling!: TestMetaSublingExchangeData;
  tags: string[];
  engineSupports: BrowserEngineType[];
  allowOptions!: string[];
  todo!: string;
  inlineJS!: string;
  argsRedefine: Partial<ArgumentsType>;
  continueOnError: boolean;
  breakParentIfResult: string;
  skipSublingIfResult: string;

  envName!: string;
  envPageName!: string;
  env!: {
    name: string;
    state: EnvStateType; // Browser, pages, cookies, etc.
    env: EnvType;
  };

  runLogic: (inputs: TestExtendType) => Promise<{ result: Record<string, unknown>; meta: Record<string, unknown> }>;
  run: (inputArgs: TestExtendType) => Promise<{ result: Record<string, unknown>; meta: Record<string, unknown> }>;

  constructor(initValues: TestExtendType) {
    this.name = initValues.name || '';
    this.envsId = initValues.envsId || '';
    this.type = initValues.type || ('type' as 'atom' | 'test');
    this.needData = initValues.needData || [];
    this.needSelectors = initValues.needSelectors || [];
    this.needEnvParams = initValues.needEnvParams || [];
    this.data = initValues.data || {};
    this.selectors = initValues.selectors || {};
    this.options = initValues.options || {};
    this.dataExt = initValues.dataExt || [];
    this.selectorsExt = initValues.selectorsExt || [];
    this.allowResults = initValues.allowResults || [];
    this.description = initValues.description || '';
    this.descriptionExtend = initValues.descriptionExtend || [];
    this.descriptionError = initValues.descriptionError || '';
    this.bindDescription = initValues.bindDescription || '';
    this.beforeTest = (initValues.beforeTest || []) as TestLifecycleFunctionType[];
    this.runTest = (initValues.runTest || []) as TestLifecycleFunctionType[];
    this.afterTest = (initValues.afterTest || []) as TestLifecycleFunctionType[];
    this.levelIndent = initValues.levelIndent || 0;
    this.repeat = initValues.repeat || 1;
    this.source = initValues.source || '';
    this.socket = initValues.socket || blankSocket;
    this.stepId = initValues.stepId || '';
    this.breadcrumbs = initValues.breadcrumbs || [];
    this.breadcrumbsDescriptions = initValues.breadcrumbsDescriptions || [];
    this.funcFile = initValues.funcFile || '';
    this.testFile = initValues.testFile || '';
    this.debug = initValues.debug || false;
    this.debugInfo = initValues.debugInfo || false;
    this.disable = initValues.disable || false;
    this.logOptions = initValues.logOptions || {};
    this.frame = initValues.frame || '';
    this.tags = initValues.tags || [];
    this.engineSupports = initValues.engineSupports || [];
    this.argsRedefine = initValues.argsRedefine || {};
    this.continueOnError = initValues.continueOnError || false;
    this.breakParentIfResult = initValues.breakParentIfResult || '';
    this.skipSublingIfResult = initValues.skipSublingIfResult || '';

    this.runLogic = async (
      inputs: TestExtendType,
    ): Promise<{ result: Record<string, unknown>; meta: Record<string, unknown> }> => {
      const startTime = getTimer().now;
      const { envsPool, logger } = Environment(this.envsId);
      const { logShowFlag, logForChild, logOptionsNew } = resolveLogOptions(
        inputs.logOptionsParent || {},
        this.logOptions,
        envsPool,
      );

      const {
        PPD_DEBUG_MODE,
        PPD_LOG_EXTEND,
        PPD_LOG_TEST_NAME,
        PPD_TAGS_TO_RUN,
        PPD_LOG_DOCUMENTATION_MODE,
        PPD_LOG_NAMES_ONLY,
        PPD_LOG_TIMER_SHOW,
        PPD_CONTINUE_ON_ERROR_ENABLED,
      } = { ...new Arguments().args, ...this.argsRedefine };

      this.debug = PPD_DEBUG_MODE && ((this.type === 'atom' && inputs.debug) || this.debug);
      if (this.debug) {
        console.log(this);
        // eslint-disable-next-line no-debugger
        debugger;
      }

      const resolveDisable = (thisDisable, metaFromPrevSubling): boolean => {
        if (thisDisable) {
          return true;
        }
        if (metaFromPrevSubling.skipBecausePrevSubling) {
          return true;
        }
        return false;
      };

      this.metaFromPrevSubling = inputs.metaFromPrevSubling || {};
      const disable = resolveDisable(this.disable, this.metaFromPrevSubling);

      if (disable) {
        await logger.log({
          text: `Skip with disable: ${getLogText(this.description, this.name, PPD_LOG_TEST_NAME)}`,
          level: 'raw',
          levelIndent: this.levelIndent,
          logShowFlag,
          textColor: 'blue',
        });
        // Drop disable for loops nested tests
        this.disable = false;
        return {
          result: {},
          meta: {
            skipBecausePrevSubling: this.metaFromPrevSubling.skipBecausePrevSubling,
            disable,
          },
        };
      }

      if (PPD_TAGS_TO_RUN.length && this.tags.length && !this.tags.filter((v) => PPD_TAGS_TO_RUN.includes(v)).length) {
        await logger.log({
          text: `Skip with tags: ${JSON.stringify(this.tags)} => ${getLogText(
            this.description,
            this.name,
            PPD_LOG_TEST_NAME,
          )}`,
          level: 'raw',
          levelIndent: this.levelIndent,
          logShowFlag,
          textColor: 'blue',
        });
        return { result: {}, meta: {} };
      }

      // Get Data from parent test and merge it with current test
      this.data = resolveAliases('data', inputs);
      this.dataParent = { ...(this.dataParent || {}), ...inputs.dataParent };
      this.bindData = resolveAliases('bindData', inputs) as Record<string, string>;
      this.dataExt = [...new Set([...this.dataExt, ...(inputs.dataExt || [])])];

      this.selectors = resolveAliases('selectors', inputs);
      this.selectorsParent = { ...(this.selectorsParent || {}), ...inputs.selectorsParent };
      this.bindSelectors = resolveAliases('bindSelectors', inputs) as Record<string, string>;
      this.selectorsExt = [...new Set([...this.selectorsExt, ...(inputs.selectorsExt || [])])];

      this.bindResults = resolveAliases('bindResults', inputs) as Record<string, string>;

      this.options = {
        ...this.options,
        ...resolveAliases('options', inputs),
        ...inputs.optionsParent,
      } as Record<string, string | number>;
      this.description = inputs.description || this.description;
      this.descriptionExtend = inputs.descriptionExtend || this.descriptionExtend || [];
      this.descriptionError = inputs.descriptionError || this.descriptionError;
      this.bindDescription = inputs.bindDescription || this.bindDescription;
      this.repeat = inputs.repeat || this.repeat;
      this.while = inputs.while || this.while;
      this.if = inputs.if || this.if;
      this.errorIf = inputs.errorIf || this.errorIf;
      this.stepId = inputs.stepId || this.stepId;
      this.errorIfResult = inputs.errorIfResult || this.errorIfResult;
      this.frame = this.frame || inputs.frame;
      this.logOptions = logOptionsNew;
      this.resultsFromPrevSubling = inputs.resultsFromPrevSubling || {};
      this.continueOnError = PPD_CONTINUE_ON_ERROR_ENABLED ? inputs.continueOnError || this.continueOnError : false;

      try {
        this.envName = envsPool.current.name || '';
        this.envPageName = envsPool.current.page || '';
        this.env = envsPool.envs[this.envName];

        if (this.engineSupports.length) {
          const { engine } = this.env?.env?.browser || {};
          if (engine && !this.engineSupports.includes(engine)) {
            throw new Error(`Current engine: '${engine}' not supported in this test`);
          }
        }

        if (this.needEnvParams.length) {
          for (const envParam of this.needEnvParams) {
            if (!envParam.endsWith('?') && !Object.keys(process.env).includes(envParam)) {
              throw new Error(`You need set environment parametr: ${envParam}`);
            }
          }
        }

        checkIntersection(this.data, this.selectors);

        let { dataLocal, selectorsLocal } = fetchData(
          this.dataExt,
          this.selectorsExt,
          this.resultsFromPrevSubling,
          this.dataParent,
          this.data,
          this.bindData,
          this.selectorsParent,
          this.selectors,
          this.bindSelectors,
          this.env,
        );

        checkNeeds(this.needData, dataLocal, this.name);
        checkNeeds(this.needSelectors, selectorsLocal, this.name);

        ({ dataLocal, selectorsLocal } = updateDataWithNeeds(
          this.needData,
          this.needSelectors,
          dataLocal,
          selectorsLocal,
        ));

        checkIntersection(dataLocal, selectorsLocal);

        const allData = { ...selectorsLocal, ...dataLocal };

        this.repeat = parseInt(runScriptInContext(String(this.repeat), allData, '1') as string, 10);
        allData.repeat = this.repeat;
        dataLocal.repeat = this.repeat;
        selectorsLocal.repeat = this.repeat;
        allData.$loop = (inputs.dataParent || {}).repeat || this.repeat;
        dataLocal.$loop = (inputs.dataParent || {}).repeat || this.repeat;
        selectorsLocal.$loop = (inputs.dataParent || {}).repeat || this.repeat;

        let descriptionResolved = this.description;
        if (this.bindDescription) {
          descriptionResolved = descriptionResolved || String(runScriptInContext(this.bindDescription, allData));
        }
        if (!descriptionResolved) {
          this.logOptions.backgroundColor = 'red';
        }

        // All data passed to log
        const args: TestArgsType = {
          envsId: this.envsId,
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
          disable: this.disable,
          logOptions: logForChild,
          frame: this.frame,
          tags: this.tags,
          ppd: globalExportPPD,
          continueOnError: this.continueOnError,
          argsEnv: { ...new Arguments().args, ...this.argsRedefine },
        };

        // IF
        if (this.if) {
          const skipIf = await checkIf(
            this.if,
            'if',
            logger.log.bind(logger),
            this.levelIndent,
            allData,
            logShowFlag,
            this.continueOnError,
          );
          if (skipIf) {
            return { result: {}, meta: {} };
          }
        }

        // ERROR IF
        if (this.errorIf) {
          await checkIf(
            this.errorIf,
            'errorIf',
            logger.log.bind(logger),
            this.levelIndent,
            allData,
            logShowFlag,
            this.continueOnError,
          );
        }

        // Extend with data passed to functions
        const pageCurrent = this.env && this.env.state?.pages && this.env.state?.pages[this.envPageName];
        const argsExt: TestArgsExtType = {
          ...args,
          env: this.env,
          envs: envsPool,
          browser: this.env && this.env.state.browser,
          page: pageCurrent, // If there is no page it`s might be API
          log: logger.log.bind(logger),
          name: this.name,
          description: descriptionResolved,
          descriptionExtend: this.descriptionExtend,
          socket: this.socket,
          allData: new TestsContent().allData,
        };

        // LOG TEST
        logger.bindData({ breadcrumbs: this.breadcrumbs, testArgs: args });

        if (!PPD_LOG_NAMES_ONLY.length || PPD_LOG_NAMES_ONLY.includes(this.name)) {
          const elements = [];
          if (this.logOptions.screenshot) {
            const atom = new Atom({ page: pageCurrent, env: this.env });
            const selectors = this.needSelectors.map((v) => selectorsLocal[v]) as string[];
            for (const selector of selectors) {
              elements.push(await atom.getElement(selector));
            }
          }

          if (!elements.length) {
            elements.push(null);
          }

          for (const element of elements) {
            await logger.log({
              text: getLogText(descriptionResolved, this.name, PPD_LOG_TEST_NAME),
              level: 'test',
              levelIndent: this.levelIndent,
              logShowFlag,
              textColor: this.logOptions.textColor,
              backgroundColor: this.logOptions.backgroundColor,
              screenshot: this.logOptions.screenshot,
              fullpage: this.logOptions.fullpage,
              screenshotName: this.logOptions.screenshotName,
              fullpageName: this.logOptions.fullpageName,
              element,
            });
          }

          if (PPD_LOG_DOCUMENTATION_MODE) {
            for (let step = 0; step < this.descriptionExtend.length; step += 1) {
              await logger.log({
                text: `${step + 1}. => ${getLogText(this.descriptionExtend[step])}`,
                level: 'test',
                textColor: 'cyan' as ColorsType,
                levelIndent: this.levelIndent + 1,
                logShowFlag,
              });
            }
          }
        }

        if (this.debugInfo) {
          logDebug(logger.log.bind(logger), 0, argsExt, true, this.debugInfo);
          if (this.debug) {
            console.log(this);
            // eslint-disable-next-line no-debugger
            debugger;
          }
        }

        // RUN FUNCTIONS
        let resultFromTest = {};

        const FUNCTIONS = [this.beforeTest, this.runTest, this.afterTest];
        for (let funcs of FUNCTIONS) {
          funcs = [funcs].flat();
          for (const func of funcs) {
            const funResult = (await func(argsExt)) || {};
            resultFromTest = { ...resultFromTest, ...funResult };
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
          { ...selectorsLocal, ...dataLocal, ...results },
        );

        const metaForNextSubling: TestMetaSublingExchangeData = {};

        // ERROR
        if (this.errorIfResult) {
          await checkIf(
            this.errorIfResult,
            'errorIfResult',
            logger.log.bind(logger),
            this.levelIndent + 1,
            { ...allData, ...localResults },
            logShowFlag,
            this.continueOnError,
          );
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
          const repeatArgs = { ...inputs };
          repeatArgs.selectors = { ...repeatArgs.selectors, ...localResults };
          repeatArgs.data = { ...repeatArgs.data, ...localResults };
          repeatArgs.repeat = this.repeat - 1;
          repeatArgs.stepId = getStepId();
          const repeatResult = await this.run(repeatArgs);
          localResults = { ...localResults, ...repeatResult };
        }

        // TIMER IN CONSOLE
        if (
          (PPD_LOG_EXTEND || PPD_LOG_TIMER_SHOW) &&
          (!PPD_LOG_NAMES_ONLY.length || PPD_LOG_NAMES_ONLY.includes(this.name))
        ) {
          await logger.log({
            text: `🕝: ${getTimer(startTime).delta} (${this.name})`,
            level: 'timer',
            levelIndent: this.levelIndent,
            logShowFlag,
            extendInfo: true,
          });
        }

        if (this.breakParentIfResult) {
          const breakParentIfResult = runScriptInContext(this.breakParentIfResult, {
            ...allData,
            ...localResults,
          });
          if (breakParentIfResult) {
            throw new ContinueParentError({
              localResults,
              errorLevel: 1,
              logger,
              test: this,
            });
          }
        }

        if (this.skipSublingIfResult) {
          const skipSublingIfResult = runScriptInContext(this.skipSublingIfResult, {
            ...allData,
            ...localResults,
          });
          if (skipSublingIfResult) {
            metaForNextSubling.disable = true;
            metaForNextSubling.skipBecausePrevSubling = true;
          }
        }

        return { result: localResults, meta: metaForNextSubling };
      } catch (error) {
        if (error instanceof ContinueParentError) {
          if (error.errorLevel) {
            await error.log();
            error.errorLevel -= 1;
            throw error;
          }
          return { result: error.localResults, meta: {} };
        }

        let newError;
        if (this.continueOnError) {
          newError = new ContinueParentError({
            localResults: error.localResults || {},
            errorLevel: 0,
            logger,
            test: this,
            parentError: error,
          });
        } else {
          newError = new TestError({ logger, parentError: error, test: this });
        }
        await newError.log();
        throw newError;
      }
    };

    this.run = async (
      inputArgs: TestExtendType,
    ): Promise<{ result: Record<string, unknown>; meta: Record<string, unknown> }> => {
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
              resolve(await this.runLogic(inputArgs));
            }
          });
        });
      }
      return this.runLogic(inputArgs);
    };
  }
}
