import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import pick from 'lodash/pick';

import { merge, blankSocket, getTimer } from './Helpers';
import Blocker from './Blocker';
import Arguments from './Arguments';
import Log from './Log';
import Environment from './Environment';
import TestsContent from './TestContent';
import { TestError } from './Error';

const vm = require('vm');

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
  ],
  options: ['option', 'opt', 'o', '⚙️'],
};

const runScriptInContext = (source: string, context: object): boolean | object | string | number | null => {
  let result: boolean | object | string | number | null;

  try {
    const script = new vm.Script(source);
    vm.createContext(context);
    result = script.runInContext(context);
  } catch (error) {
    throw new Error(`Can't evaluate ${source} = '${error.message}'`);
  }

  return result;
};

const checkNeeds = (needs: Array<string>, data: Object, testName: string): boolean => {
  // [['data', 'd'], 'another', 'optional?']
  const keysData = new Set(Object.keys(data));
  needs.forEach((d) => {
    if (isString(d) && d.endsWith('?')) return; // optional parameter
    const keysDataIncome = new Set(isString(d) ? [d] : d);
    const intersectionData = new Set([...keysData].filter((x) => keysDataIncome.has(x)));
    if (!intersectionData.size) {
      throw new Error(`Error: can't find data parameter "${d}" in ${testName} test`);
    }
  });
  return true;
};

const resolveDataFunctions = (funcParams: { [key: string]: string }, allData: Object): Object => {
  const funcEval = Object.entries(funcParams).reduce((s, v) => {
    const [key, data] = v;
    const evalData = runScriptInContext(data, allData);
    const collector = { ...s, ...{ [key]: evalData } };
    return collector;
  }, {});
  return funcEval;
};

const resolveAliases = (valueName: string, inputs: Object = {}): Object => {
  try {
    const values = [valueName, ...(ALIASES[valueName] || [])];
    const result = values.reduce((collector: Object, name: string) => ({ ...collector, ...(inputs[name] || {}) }), {});
    return result;
  } catch (error) {
    error.message += ` || function resolveAliases(${valueName})`;
    throw error;
  }
};

const checkNeedEnv = (needEnv: string | string[], envName: string): void => {
  const needEnvs = isString(needEnv) ? [needEnv] : needEnv;
  if (Array.isArray(needEnvs)) {
    if (needEnvs.length && !needEnvs.includes(envName)) {
      throw new Error(`Wrong Environment, local current env = ${envName}, but test pass needEnvs = ${needEnvs}`);
    }
  } else {
    throw new Error('needEnv wrong format, should be array or string');
  }
};

export default class Test {
  name: string;
  type: string;
  needEnv: Array<string>;
  needData: Array<string>;
  needSelectors: Array<string>;
  dataParent: Object;
  selectorsParent: Object;
  options: Object;
  dataExt: Array<string>;
  selectorsExt: Array<string>;
  allowResults: Array<string>;
  beforeTest: any;
  runTest: any;
  afterTest: any;
  levelIndent: number;
  repeat: number;
  source: Object;
  socket: SocketType;
  stepId: string;
  breadcrumbs: Array<string>;
  funcFile: string;
  testFile: string;
  debug: boolean;

  data: Object;
  bindData: Object;
  selectors: Object;
  bindSelectors: Object;
  bindResults: Object;
  description: string;
  while: string;
  if: string;
  errorIf: string;
  errorIfResult: string;
  resultsFromChildren: any;
  resultsFromParent: any;

  envName: string;
  envPageName: string;
  env: any;

  fetchDataNew: any;
  fetchSelectorsNew: any;
  checkIf: any;
  runLogic: any;
  run: any;

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
    beforeTest = (): void => {},
    runTest = (): void => {},
    afterTest = (): void => {},
    source = '',
    repeat = 1,
    socket = blankSocket,
    stepId = null,
    breadcrumbs = [],
    funcFile = null,
    testFile = null,
    debug = false,
    ...constructorArgs
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

    this.fetchDataNew = (): Object => {
      const { PPD_DATA } = new Arguments().args;

      const { data: allData } = new TestsContent().allData;
      const dataExtResolved = this.dataExt.reduce((collect, v) => {
        const extData = allData.find((d) => v === d.name);
        return { ...collect, ...extData };
      }, {});

      const dataFlow = [
        PPD_DATA,
        this.env?.env?.data || {},
        dataExtResolved,
        this.dataParent,
        this.resultsFromParent,
        this.data,
      ];
      let dataLocal = merge(...dataFlow);
      const bindDataLocal = this.bindData;
      Object.entries(bindDataLocal).forEach((v: [string, string]) => {
        const [key, val] = v;
        dataLocal = { ...dataLocal, ...resolveDataFunctions({ [key]: val }, dataLocal) };
      });
      return dataLocal;
    };

    this.fetchSelectorsNew = (): Object => {
      const { PPD_SELECTORS } = new Arguments().args;

      const { selectors: allSelectors } = new TestsContent().allData;
      const selectorsExtResolved = this.selectorsExt.reduce((collect, v) => {
        const extData = allSelectors.find((d) => v === d.name);
        return { ...collect, ...extData };
      }, {});

      const dataFlow = [
        PPD_SELECTORS,
        this.env?.env?.selectors || {},
        selectorsExtResolved,
        this.selectorsParent,
        this.resultsFromParent,
        this.selectors,
      ];
      let selectorsLocal = merge(...dataFlow);
      const bindSelectorsLocal = this.bindSelectors;
      Object.entries(bindSelectorsLocal).forEach((v: [string, string]) => {
        const [key, val] = v;
        selectorsLocal = { ...selectorsLocal, ...resolveDataFunctions({ [key]: val }, selectorsLocal) };
      });
      return selectorsLocal;
    };

    this.checkIf = async (
      expr: string,
      ifType: string,
      log: Function,
      ifLevelIndent: number,
      allData: Object = {},
    ): Promise<boolean> => {
      const exprResult = runScriptInContext(expr, allData);

      if (!exprResult && ifType === 'if') {
        await log({
          level: 'info',
          screenshot: false,
          fullpage: false,
          levelIndent: ifLevelIndent,
          text: `Skipping with expr '${expr}'`,
        });
        return true;
      }

      if (exprResult && ifType !== 'if') {
        await log({
          level: 'error',
          levelIndent: ifLevelIndent,
          text: `Test stopped with expr ${ifType} = '${expr}'`,
        });
        throw new Error(`Test stopped with expr ${ifType} = '${expr}'`);
      }

      return false;
    };

    this.runLogic = async (envsId: string, inputArgs: Object = {}): Promise<any> => {
      const startTime = process.hrtime.bigint();

      const { PPD_DEBUG_MODE } = new Arguments().args;
      const inputs: InputsTestType = merge(constructorArgs, inputArgs);

      // Get Data from parent test and merge it with current test
      this.data = resolveAliases('data', inputs);
      this.dataParent = merge(this.dataParent || {}, inputs.dataParent);
      this.bindData = resolveAliases('bindData', inputs);
      this.dataExt = [...new Set([...this.dataExt, ...(inputs.dataExt || [])])];

      this.selectors = resolveAliases('selectors', inputs);
      this.selectorsParent = merge(this.selectorsParent || {}, inputs.selectorsParent);
      this.bindSelectors = resolveAliases('bindSelectors', inputs);
      this.selectorsExt = [...new Set([...this.selectorsExt, ...(inputs.selectorsExt || [])])];

      this.bindResults = resolveAliases('bindResults', inputs);
      this.resultsFromParent = inputs.resultsFromParent;

      this.options = merge(this.options, resolveAliases('options', inputs), inputs.optionsParent);
      this.description = inputs.description || this.description;
      this.repeat = inputs.repeat || this.repeat;
      this.while = inputs.while || this.while;
      this.if = inputs.if || this.if;
      this.errorIf = inputs.errorIf || this.errorIf;
      this.errorIfResult = inputs.errorIfResult || this.errorIfResult;
      this.debug = PPD_DEBUG_MODE && (inputs.debug || this.debug);

      const { envsPool } = Environment(envsId);
      const logger = new Log(envsId);

      try {
        const { PPD_DISABLE_ENV_CHECK, PPD_LOG_EXTEND } = new Arguments().args;

        this.envName = envsPool.current.name;
        this.envPageName = envsPool.current.page;
        this.env = envsPool.envs[this.envName];

        if (!PPD_DISABLE_ENV_CHECK) {
          checkNeedEnv(this.needEnv, this.envName);
        }

        const dataLocal = this.fetchDataNew();
        const selectorsLocal = this.fetchSelectorsNew();
        const allData = merge(selectorsLocal, dataLocal);

        checkNeeds(needData, dataLocal, this.name);
        checkNeeds(needSelectors, selectorsLocal, this.name);

        // All data passed to log
        const argsFields = [
          'envName',
          'envPageName',
          'options',
          'allowResults',
          'bindResults',
          'bindSelectors',
          'bindData',
          'levelIndent',
          'repeat',
          'stepId',
          'debug',
        ];
        const args = {
          envsId,
          data: dataLocal,
          selectors: selectorsLocal,
          ...pick(this, argsFields),
        };

        // LOG TEST
        logger.bindData({ testSource: source, bindedData: args });
        await logger.log({
          text: this.description
            ? `(${this.name}) ${this.description}`
            : `(${this.name}) \u001B[41mTODO: Fill description\u001B[0m`,
          level: 'test',
          levelIndent,
        });

        // Extend with data passed to functions
        const argsExt = {
          ...args,
          env: this.env,
          envs: envsPool,
          browser: this.env && this.env.state.browser,
          page: this.env && this.env.state.pages[this.envPageName], // If there is no page it`s might be API
          log: logger.log.bind(logger),
          name: this.name,
          description: this.description,
          socket: this.socket,
        };

        // IF
        if (this.if) {
          const skip = await this.checkIf(this.if, 'if', logger.log.bind(logger), this.levelIndent + 1, allData);
          if (skip) {
            return;
          }
        }

        // ERROR IF
        if (this.errorIf) {
          await this.checkIf(this.errorIf, 'errorIf', logger.log.bind(logger), this.levelIndent + 1, allData);
        }

        // RUN FUNCTIONS
        const FUNCTIONS = [this.beforeTest, this.runTest, this.afterTest];
        let resultFromTest = {};

        for (let i = 0; i < FUNCTIONS.length; i += 1) {
          let funcs = FUNCTIONS[i];

          if (isFunction(funcs)) {
            funcs = [funcs];
          }
          if (Array.isArray(funcs)) {
            for (let f = 0; f < funcs.length; f += 1) {
              const fun = funcs[f];
              // eslint-disable-next-line no-await-in-loop
              const funResult = (await fun(argsExt)) || {};
              resultFromTest = merge(resultFromTest, funResult);
            }
          }
        }

        // RESULTS
        const results = allowResults.length ? pick(resultFromTest, allowResults) : resultFromTest;
        if (
          allowResults.length &&
          Object.keys(results).length &&
          Object.keys(results).length !== [...new Set(allowResults)].length
        ) {
          throw new Error('Can`t get results from test');
        }
        const allowResultsObject = allowResults.reduce((collect, v) => ({ ...collect, ...{ [v]: v } }), {});
        let localResults = resolveDataFunctions(
          { ...this.bindResults, ...allowResultsObject },
          merge(selectorsLocal, dataLocal, results),
        );

        // ERROR
        if (this.errorIfResult) {
          await this.checkIf(this.errorIfResult, 'errorIfResult', logger.log.bind(logger), this.levelIndent + 1, {
            ...allData,
            ...localResults,
          });
        }

        // WHILE
        if (this.while) {
          const whileEval = runScriptInContext(this.while, allData);
          if (!whileEval) {
            return;
          }
        }

        // REPEAT
        if (this.repeat > 1) {
          const repeatArgs = JSON.parse(JSON.stringify(inputArgs));
          repeatArgs.selectors = { ...repeatArgs.selectors, ...localResults };
          repeatArgs.data = { ...repeatArgs.data, ...localResults };
          repeatArgs.repeat = this.repeat - 1;
          const repeatResult = await this.run(envsId, repeatArgs);
          localResults = { ...localResults, ...repeatResult };
        }

        // TIMER IN CONSOLE
        if (PPD_LOG_EXTEND) {
          await logger.log({
            text: `🕝: ${getTimer(startTime)} s. (${this.name})`,
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

    // eslint-disable-next-line no-shadow
    this.run = async (envsId: string, inputArgs = {}): Promise<Function> => {
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
