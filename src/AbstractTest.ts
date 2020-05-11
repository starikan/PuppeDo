import isString from 'lodash/isString';
import cloneDeep from 'lodash/cloneDeep';
import isFunction from 'lodash/isFunction';
import pick from 'lodash/pick';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import { merge, blankSocket } from './Helpers';
import Blocker from './Blocker';
import Arguments from './Arguments';
import Log from './Log';
import Environment from './Environment';
import TestsContent from './TestContent';
import { TestError } from './Error';

const vm = require('vm');

type LocalsType = {
  dataLocal?: any;
  selectorsLocal?: any;
  localResults?: any;
};

type InputsType = {
  options?: any;
  description?: any;
  repeat?: any;
  while?: any;
  if?: any;
  errorIf?: any;
  errorIfResult?: any;
  debug?: boolean;
};

const ALIASES = {
  data: ['d', '📋'],
  bindData: ['bD', 'bd', '📌📋', 'dataBind', 'db', 'dB'],
  dataFunction: ['dF', 'df', '🔑📋', 'functionData', 'fd', 'fD'],
  selectors: ['selector', 's', '💠'],
  bindSelectors: ['bindSelector', 'bS', 'bs', '📌💠', 'selectorBind', 'selectorsBind', 'sb', 'sB'],
  selectorsFunction: ['selectorFunction', 'sF', 'sf', '🔑💠', 'functionSelector', 'functionSelectors', 'fs', 'fS'],
  bindResults: ['bindResult', 'bR', 'br', 'result', 'r', '↩️', 'R', 'rb', 'rB', 'resultBind', 'resultsBind'],
  resultFunction: ['rF', 'rf', '🔑↩️', 'functionResult', 'fr', 'fR'],
  options: ['option', 'opt', 'o', '⚙️'],
};

const runScriptInContext = (source: string, context: object): boolean | object | string | number | null => {
  let result;

  try {
    const script = new vm.Script(source);
    vm.createContext(context);
    result = script.runInContext(context);
  } catch (error) {
    throw new Error(`Can't evaluate ${source} = '${error.message}'`);
  }

  return result;
};

const checkNeeds = (needs, data, testName) => {
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

const resolveDataFunctions = (funcParams, dataLocal, selectorsLocal = {}) => {
  const allDataSel = merge(dataLocal, selectorsLocal);
  const funcEval = Object.entries(funcParams).reduce((s, v) => {
    const [key, data] = v;
    const evalData = runScriptInContext(data.toString(), allDataSel);
    const collector = { ...s, ...{ [key]: evalData } };
    return collector;
  }, {});
  return funcEval;
};

const resolveAliases = (valueName, inputs = {}, aliases = {}) => {
  try {
    let result = {};
    const values = [valueName, ...get(aliases, valueName, [])];
    values.forEach((v) => {
      result = merge(result, inputs[v] || {});
    });
    return result;
  } catch (error) {
    error.message += ` || function resolveAliases(${valueName})`;
    throw error;
  }
};

const checkNeedEnv = (needEnv, envName) => {
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
  name: any;
  type: any;
  needEnv: any;
  needData: any;
  needSelectors: any;
  dataTest: any;
  selectorsTest: any;
  options: any;
  dataExt: any;
  selectorsExt: any;
  allowResults: any;
  beforeTest: any;
  runTest: any;
  afterTest: any;
  levelIndent: any;
  repeat: any;
  source: any;
  socket: any;
  stepId: any;
  breadcrumbs: any;
  funcFile: any;
  testFile: any;
  debug: boolean;

  data: any;
  bindData: any;
  dataFunction: any;
  selectors: any;
  bindSelectors: any;
  selectorsFunction: any;
  bindResults: any;
  resultFunction: any;
  description: any;
  while: any;
  if: any;
  errorIf: any;
  errorIfResult: any;

  envs: any;
  envName: any;
  envPageName: any;
  env: any;

  fetchData: any;
  fetchSelectors: any;
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
    beforeTest = () => {},
    runTest = () => {},
    afterTest = () => {},
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
    this.dataTest = data;
    this.selectorsTest = selectors;
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

    this.fetchData = (isSelector = false) => {
      const { PPD_SELECTORS, PPD_DATA } = new Arguments().args;
      const dataName = isSelector ? 'selectors' : 'data';

      // * Get data from ENV params global
      let joinArray = isSelector ? [PPD_SELECTORS] : [PPD_DATA];

      // * Get data from current env
      joinArray = [...joinArray, this.env ? this.env.env[dataName] : {}];

      // * Get data from global envs for all tests
      joinArray = [...joinArray, this.envs[dataName] || {}];

      // * Fetch data from ext files that passed in test itself
      const allTests = new TestsContent().allData;
      const extFiles = isSelector ? this.selectorsExt : this.dataExt;
      extFiles.forEach((v) => {
        const extData = allTests[dataName].find((d) => v === d.name);
        if (extData) {
          joinArray = [...joinArray, extData.data];
        }
      });

      // * Get data from test itself in test describe
      joinArray = [...joinArray, isSelector ? this.selectorsTest : this.dataTest];

      // * Update local data with bindings
      let dataLocal = merge(...joinArray);
      const bindDataLocal = isSelector ? this.bindSelectors : this.bindData;
      Object.entries(bindDataLocal).forEach((v: [string, string]) => {
        const [key, val] = v;
        dataLocal[key] = get(dataLocal, val);
      });

      // * Update after all bindings with data from test itself passed in running
      const collectedData = isSelector ? this.selectors : this.data;
      dataLocal = merge(dataLocal, collectedData);

      return dataLocal;
    };

    this.fetchSelectors = () => this.fetchData(true);

    this.checkIf = async (expr, ifType, log, ifLevelIndent, locals: LocalsType = {}) => {
      const { dataLocal = {}, selectorsLocal = {}, localResults = {} } = locals;

      const context = cloneDeep(merge(dataLocal, selectorsLocal, localResults));
      const exprResult = runScriptInContext(expr, context);

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

    this.runLogic = async ({ dataExtLogic = [], selectorsExtLogic = [], inputArgs = {} } = {}, envsId = null) => {
      const startTime = new Date().getTime();

      const inputs: InputsType = merge(constructorArgs, inputArgs);

      this.data = resolveAliases('data', inputs, ALIASES);
      this.bindData = resolveAliases('bindData', inputs, ALIASES);
      this.dataFunction = resolveAliases('dataFunction', inputs, ALIASES);
      this.dataExt = [...new Set([...this.dataExt, ...dataExtLogic])];
      this.selectors = resolveAliases('selectors', inputs, ALIASES);
      this.bindSelectors = resolveAliases('bindSelectors', inputs, ALIASES);
      this.selectorsFunction = resolveAliases('selectorsFunction', inputs, ALIASES);
      this.selectorsExt = [...new Set([...this.selectorsExt, ...selectorsExtLogic])];

      this.bindResults = resolveAliases('bindResults', inputs, ALIASES);
      this.resultFunction = resolveAliases('resultFunction', inputs, ALIASES);

      this.options = merge(this.options, inputs.options || {}, resolveAliases('options', inputs, ALIASES));
      this.description = inputs.description || this.description;
      this.repeat = inputs.repeat || this.repeat;
      this.while = inputs.while || this.while;
      this.if = inputs.if || this.if;
      this.errorIf = inputs.errorIf || this.errorIf;
      this.errorIfResult = inputs.errorIfResult || this.errorIfResult;
      this.debug = inputs.debug || this.debug;

      if (!envsId) {
        throw new Error('Test should have envsId');
      }

      const { envs } = Environment(envsId);
      const logger = new Log(envsId);

      try {
        const { PPD_DISABLE_ENV_CHECK, PPD_LOG_EXTEND } = new Arguments().args;

        this.envs = envs;
        this.envName = this.envs.current.name;
        this.envPageName = this.envs.current.page;
        this.env = this.envs.envs[this.envName];

        if (!PPD_DISABLE_ENV_CHECK) {
          checkNeedEnv(this.needEnv, this.envName);
        }

        let dataLocal = this.fetchData();
        let selectorsLocal = this.fetchSelectors();
        const allData = merge(dataLocal, selectorsLocal);

        // FUNCTIONS
        const dFResults = resolveDataFunctions(this.dataFunction, allData);
        const sFResults = resolveDataFunctions(this.selectorsFunction, allData);

        // Update data and selectors with functions result
        dataLocal = merge(dataLocal, dFResults);
        selectorsLocal = merge(selectorsLocal, sFResults);

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
          dataTest: this.data,
          selectorsTest: this.selectors,
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
          envs: this.envs,
          browser: this.env && this.env.state.browser,
          page: this.env && this.env.state.pages[this.envPageName], // If there is no page it`s might be API
          log: logger.log.bind(logger),
          name: this.name,
          description: this.description,
          socket: this.socket,
        };

        // IF
        if (this.if) {
          const skip = await this.checkIf(this.if, 'if', logger.log.bind(logger), this.levelIndent + 1, {
            dataLocal,
            selectorsLocal,
          });
          if (skip) {
            return;
          }
        }

        // ERROR IF
        if (this.errorIf) {
          await this.checkIf(this.errorIf, 'errorIf', logger.log.bind(logger), this.levelIndent + 1, {
            dataLocal,
            selectorsLocal,
          });
        }

        // Set ENVS Data for the further nested tests
        if (this.env) {
          this.envs.data = merge(this.envs.data, dataLocal);
          this.envs.selectors = merge(this.envs.selectors, selectorsLocal);
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
        // TODO: raise warning if not needed in allowResults

        // If Test there is no JS return. Get all data to read values
        if (this.type === 'test') {
          resultFromTest = merge(this.envs.data, this.envs.selectors);
        }

        const results = pick(resultFromTest, allowResults);

        if (Object.keys(results).length && Object.keys(results).length !== [...new Set(allowResults)].length) {
          throw new Error('Can`t get results from test');
        }

        Object.entries(this.bindResults).forEach((v: [string, string]) => {
          const [key, val] = v;
          results[key] = get(results, val);
        });
        let localResults = { ...results };

        // RESULT FUNCTIONS
        if (!isEmpty(this.resultFunction)) {
          const dataWithResults = merge(dataLocal, selectorsLocal, results);
          const resultFunction = resolveDataFunctions(this.resultFunction, dataWithResults);
          dataLocal = merge(dataLocal, resultFunction);
          selectorsLocal = merge(selectorsLocal, resultFunction);
          localResults = merge(localResults, resultFunction);
        }

        // Set ENVS Data
        if (this.env) {
          this.envs.data = merge(this.envs.data, dataLocal, localResults);
          this.envs.selectors = merge(this.envs.selectors, selectorsLocal, localResults);
        }

        // ERROR
        if (this.errorIfResult) {
          await this.checkIf(this.errorIfResult, 'errorIfResult', logger.log.bind(logger), this.levelIndent + 1, {
            dataLocal,
            selectorsLocal,
            localResults,
          });
        }

        // WHILE
        if (this.while) {
          const allDataSel = merge(dataLocal, selectorsLocal);
          const whileEval = runScriptInContext(this.while, allDataSel);
          if (!whileEval) {
            return;
          }
        }

        // REPEAT
        if (this.repeat > 1) {
          await this.run(
            { dataExt: this.dataExt, selectorsExt: this.selectorsExt, ...inputArgs, ...{ repeat: this.repeat - 1 } },
            envsId,
          );
        }

        // TIMER IN CONSOLE
        if (PPD_LOG_EXTEND) {
          await logger.log({
            text: `🕝: ${new Date().getTime() - startTime} ms. (${this.name})`,
            level: 'timer',
            levelIndent,
            extendInfo: true,
          });
        }
      } catch (error) {
        const newError = new TestError({ logger, parentError: error, test: this, envsId });
        await newError.log();
        throw newError;
      }
    };

    // eslint-disable-next-line no-shadow
    this.run = async ({ dataExt = [], selectorsExt = [], ...inputArgs } = {}, envsId = null) => {
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
              await this.runLogic({ dataExtLogic: dataExt, selectorsExtLogic: selectorsExt, inputArgs }, envsId);
              resolve();
            }
          });
        });
      }
      return this.runLogic({ dataExtLogic: dataExt, selectorsExtLogic: selectorsExt, inputArgs }, envsId);
    };
  }
}
