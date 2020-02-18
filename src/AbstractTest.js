const _ = require('lodash');
const safeEval = require('safe-eval');

const { merge, blankSocket } = require('./Helpers.js');
const { Blocker } = require('./Blocker.js');
const { Arguments } = require('./Arguments.js');
const { Log } = require('./Log.js');
const Environment = require('./Environment.js');
const TestsContent = require('./TestContent.js');

const ALIASES = {
  data: ['d', '📋'],
  bindData: ['bD', 'bd', '📌📋'],
  dataFunction: ['dF', 'df', '🔑📋'],
  selectors: ['selector', 's', '💠'],
  bindSelectors: ['bindSelector', 'bS', 'bs', '📌💠'],
  selectorsFunction: ['selectorFunction', 'sF', 'sf', '🔑💠'],
  bindResults: ['bindResult', 'bR', 'br', 'result', 'r', '↩️'],
  resultFunction: ['rF', 'rf', '🔑↩️'],
  options: ['option', 'opt', 'o', '⚙️'],
};

const checkNeeds = (needs, data, testName) => {
  // [['data', 'd'], 'another', 'optional?']
  const keysData = new Set(Object.keys(data));
  _.forEach(needs, (d) => {
    if (_.isString(d) && d.endsWith('?')) return; // optional parameter
    const keysDataIncome = new Set(_.isString(d) ? [d] : d);
    const intersectionData = new Set([...keysData].filter((x) => keysDataIncome.has(x)));
    if (!intersectionData.size) {
      throw new Error({ message: `Error: can't find data parameter "${d}" in ${testName} test` });
    }
  });
  return true;
};

const resolveDataFunctions = (funcParams, dataLocal, selectorsLocal = {}) => {
  const allDataSel = merge(dataLocal, selectorsLocal);
  const funcEval = Object.entries(funcParams).reduce((s, v) => {
    const [key, data] = v;
    const evalData = safeEval(data.toString(), allDataSel);
    const collector = { ...s, ...{ [key]: evalData } };
    return collector;
  }, {});
  return funcEval;
};

const resolveAliases = (valueName, inputs = {}, aliases = {}) => {
  try {
    let result = {};
    const values = [valueName, ..._.get(aliases, valueName, [])];
    values.forEach((v) => {
      result = merge(result, _.get(inputs, v, {}));
    });
    return result;
  } catch (error) {
    error.message += ` || function resolveAliases(${valueName})`;
    throw error;
  }
};

const checkNeedEnv = ({ needEnv, envName } = {}) => {
  const needEnvs = _.isString(needEnv) ? [needEnv] : needEnv;
  if (_.isArray(needEnvs)) {
    if (needEnvs.length && !needEnvs.includes(envName)) {
      throw new Error({
        message: `Wrong Environment, local current env = ${envName}, but test pass needEnvs = ${needEnvs}`,
      });
    }
  } else {
    throw new Error({ message: 'needEnv wrong format, should be array or string' });
  }
};

class Test {
  constructor({
    name,
    type = 'test',
    levelIndent = 0,
    needEnv = [],
    needData = [],
    needSelectors = [],
    allowResults = [],
    data = {},
    selectors = {},
    dataExt = [],
    selectorsExt = [],
    beforeTest = () => {},
    runTest = () => {},
    afterTest = () => {},
    errorTest = () => {},
    source = '',
    repeat = 1,
    socket = blankSocket,
    stepId = null,
    breadcrumbs = [],
    ...constructorArgs
  } = {}) {
    this.name = name;
    this.type = type;
    this.needEnv = needEnv;
    this.needData = needData;
    this.needSelectors = needSelectors;
    this.dataTest = data;
    this.selectorsTest = selectors;
    this.dataExt = dataExt;
    this.selectorsExt = selectorsExt;
    this.allowResults = allowResults;
    this.beforeTest = beforeTest;
    this.runTest = runTest;
    this.afterTest = afterTest;
    this.errorTest = errorTest;
    this.levelIndent = levelIndent;
    this.repeat = repeat;
    this.source = source;
    this.socket = socket;
    this.stepId = stepId;
    this.breadcrumbs = breadcrumbs;
    this.funcFile = constructorArgs.funcFile;
    this.testFile = constructorArgs.testFile;

    this.fetchData = (isSelector = false) => {
      const { PPD_SELECTORS, PPD_DATA } = new Arguments();
      const dataName = isSelector ? 'selectors' : 'data';

      // * Get data from ENV params global
      let joinArray = isSelector ? [PPD_SELECTORS] : [PPD_DATA];

      // * Get data from global envs for all tests
      joinArray = [...joinArray, this.envs.get(dataName, {})];

      // * Get data from current env
      joinArray = [...joinArray, this.env ? this.env.get(dataName) : {}];

      // * Fetch data from ext files that passed in test itself
      const allTests = new TestsContent();
      const extFiles = isSelector ? this.selectorsExt : this.dataExt;
      extFiles.forEach((v) => {
        const extData = allTests[dataName].find((d) => v === d.name);
        if (extData) {
          joinArray = [...joinArray, extData.data];
        }
      });

      // * Get data from test itself in test describe
      joinArray = [...joinArray, isSelector ? this.selectorsTest : this.dataTest];

      // * Get data from user function results and results
      joinArray = [...joinArray, this.envs.get('results', {}), this.envs.get('resultsFunc', {})];

      // * Update local data with bindings
      let dataLocal = merge(...joinArray);
      const bindDataLocal = isSelector ? this.bindSelectors : this.bindData;
      for (const key in bindDataLocal) {
        dataLocal[key] = _.get(dataLocal, bindDataLocal[key]);
      }

      // * Update after all bindings with data from test itself passed in running
      const data = isSelector ? this.selectors : this.data;
      dataLocal = merge(dataLocal, data);

      return dataLocal;
    };

    this.fetchSelectors = () => this.fetchData(true);

    this.collectDebugData = (errorIncome, locals = {}, message = null) => {
      const error = { ...errorIncome };
      const fields = [
        'data',
        'bindData',
        'dataFunction',
        'dataExt',
        'selectors',
        'bindSelectors',
        'selectorsFunction',
        'selectorsExt',
        'bindResults',
        'resultFunction',
        'options',
        'repeat',
        'while',
        'if',
        'errorIf',
        'errorIfResult',
      ];
      error.test = _.pick(this, fields);
      error.testLocal = locals;
      if (message) {
        error.message = message;
      }
      return error;
    };

    this.checkIf = async (expr, type, log, levelIndent, locals = {}) => {
      let exprResult;
      const { dataLocal = {}, selectorsLocal = {}, localResults = {}, results = {} } = locals;

      try {
        exprResult = safeEval(expr, merge(dataLocal, selectorsLocal, localResults, results));
      } catch (error) {
        if (error.name === 'ReferenceError') {
          await log({
            level: 'error',
            screenshot: true,
            fullpage: true,
            text: `(${this.name}) ${
              this.description ? this.description : 'TODO: Fill description'
            } -> Can't evaluate ${type} = '${error.message}'`,
          });
        }
        throw this.collectDebugData(error, locals);
      }

      if (!exprResult && type === 'if') {
        await log({
          level: 'info',
          screenshot: false,
          fullpage: false,
          text: `(${this.name}) ${
            this.description ? this.description : 'TODO: Fill description'
          } -> Skipping with expr '${expr}'`,
          levelIndent,
        });
        return true;
      }

      if (exprResult && type !== 'if') {
        await log({
          level: 'error',
          screenshot: true,
          fullpage: true,
          text: `(${this.name}) ${
            this.description ? this.description : 'TODO: Fill description'
          } -> Test stopped with expr ${type} = '${expr}'`,
          levelIndent,
        });
        throw this.collectDebugData({}, locals, `Test stopped with expr ${type} = '${expr}'`);
      }
    };

    this.runLogic = async ({ dataExt = [], selectorsExt = [], ...inputArgs } = {}, envsId) => {
      const startTime = new Date();

      const inputs = merge(inputArgs, constructorArgs);

      this.data = resolveAliases('data', inputs, ALIASES);
      this.bindData = resolveAliases('bindData', inputs, ALIASES);
      this.dataFunction = resolveAliases('dataFunction', inputs, ALIASES);
      this.dataExt = [...new Set([...this.dataExt, ...dataExt])];

      this.selectors = resolveAliases('selectors', inputs, ALIASES);
      this.bindSelectors = resolveAliases('bindSelectors', inputs, ALIASES);
      this.selectorsFunction = resolveAliases('selectorsFunction', inputs, ALIASES);
      this.selectorsExt = [...new Set([...this.selectorsExt, ...selectorsExt])];

      this.bindResults = resolveAliases('bindResults', inputs, ALIASES);
      this.resultFunction = resolveAliases('resultFunction', inputs, ALIASES);

      this.options = resolveAliases('options', inputs, ALIASES);
      this.description = _.get(inputArgs, 'description') || _.get(constructorArgs, 'description') || this.description;
      this.repeat = _.get(inputArgs, 'repeat') || _.get(constructorArgs, 'repeat') || this.repeat;
      this.while = _.get(inputArgs, 'while') || _.get(constructorArgs, 'while') || this.while;
      this.if = _.get(inputArgs, 'if') || _.get(constructorArgs, 'if') || this.if;
      this.errorIf = _.get(inputArgs, 'errorIf') || _.get(constructorArgs, 'errorIf') || this.errorIf;
      this.errorIfResult =
        _.get(inputArgs, 'errorIfResult') || _.get(constructorArgs, 'errorIfResult') || this.errorIfResult;

      if (!envsId) {
        throw new Error({ message: 'Test should have envsId' });
      }

      const { envs } = Environment({ envsId });
      const logger = new Log({ envsId });

      try {
        const { PPD_DISABLE_ENV_CHECK, PPD_LOG_EXTEND } = new Arguments();

        this.envs = envs;
        this.envName = this.envs.get('current.name');
        this.envPageName = this.envs.get('current.page');
        this.env = this.envs.get(`envs.${this.envName}`);

        if (!PPD_DISABLE_ENV_CHECK) {
          checkNeedEnv({ needEnv: this.needEnv, envName: this.envName });
        }

        let dataLocal = this.fetchData();
        let selectorsLocal = this.fetchSelectors();
        const allData = merge(dataLocal, selectorsLocal);

        // FUNCTIONS
        const dFResults = resolveDataFunctions(this.dataFunction, allData);
        const sFResults = resolveDataFunctions(this.selectorsFunction, allData);

        // Save all functions results into envs
        this.envs.set('resultsFunc', merge(this.envs.get('resultsFunc', {}), dFResults));
        this.envs.set('resultsFunc', merge(this.envs.get('resultsFunc', {}), sFResults));

        // Update data and selectors with functions result
        dataLocal = merge(dataLocal, dFResults);
        selectorsLocal = merge(selectorsLocal, sFResults);

        // Write data to local env. For next tests.
        if (this.env) {
          this.env.set('env.data', dataLocal);
          this.env.set('env.selectors', selectorsLocal);
        }

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
        ];
        const args = {
          envsId,
          data: dataLocal,
          selectors: selectorsLocal,
          dataTest: this.data,
          selectorsTest: this.selectors,
          ..._.pick(this, argsFields),
        };

        // LOG TEST
        logger.bindData({ testSource: source, bindedData: args });
        await logger.log({
          text: this.description ? `(${this.name}) ${this.description}` : `(${this.name}) TODO: Fill description`,
          level: 'test',
          levelIndent,
        });

        // Extend with data passed to functions
        const argsExt = {
          ...args,
          env: this.env,
          envs: this.envs,
          browser: this.env ? this.env.getState('browser') : null,
          // If there is no page it`s might be API
          page: this.env ? this.env.getState(`pages.${this.envPageName}`) : null,
          log: logger.log.bind(logger),
          _,
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

        // RUN FUNCTIONS
        const FUNCTIONS = [this.beforeTest, this.runTest, this.afterTest];
        let resultFromTest = {};

        for (let i = 0; i < FUNCTIONS.length; i += 1) {
          let funcs = FUNCTIONS[i];

          if (_.isFunction(funcs)) {
            funcs = [funcs];
          }
          if (_.isArray(funcs)) {
            for (let f = 0; f < funcs.length; f += 1) {
              const fun = funcs[f];
              const funResult = (await fun(argsExt)) || {};
              // resultFromTest = merge(dataLocal, selectorsLocal, resultFromTest, funResult);
              resultFromTest = merge(resultFromTest, funResult);
            }
          }
        }

        // RESULTS
        // TODO: raise warning if not needed in allowResults

        // If Test there is no JS return. Get all data to read values
        if (this.type === 'test') {
          resultFromTest = merge(this.fetchData(), this.fetchSelectors());
        }

        const results = _.pick(resultFromTest, allowResults);
        let localResults = {};

        if (Object.keys(results).length && Object.keys(results).length !== [...new Set(allowResults)].length) {
          throw new Error({ message: 'Can`t get results from test' });
        }

        for (const key in this.bindResults) {
          // results[this.bindResults[key]] = _.get(results, key);
          results[key] = _.get(results, this.bindResults[key]);
        }
        localResults = results;

        envs.set('results', merge(envs.get('results'), results));

        // RESULT FUNCTIONS
        if (!_.isEmpty(this.resultFunction)) {
          const dataWithResults = merge(dataLocal, selectorsLocal, results);
          const resultFunction = resolveDataFunctions(this.resultFunction, dataWithResults);
          dataLocal = merge(dataLocal, resultFunction);
          selectorsLocal = merge(selectorsLocal, resultFunction);
          localResults = merge(localResults, resultFunction);
          envs.set('results', merge(envs.get('results'), localResults));
        }

        // ERROR
        if (this.errorIfResult) {
          await this.checkIf(this.errorIfResult, 'errorIfResult', logger.log.bind(logger), this.levelIndent + 1, {
            dataLocal,
            selectorsLocal,
            localResults,
            results,
          });
        }

        // WHILE
        if (this.while) {
          const allDataSel = merge(dataLocal, selectorsLocal);
          const whileEval = safeEval(this.while, allDataSel);
          if (!whileEval) {
            return;
          }
        }

        // REPEAT
        if (this.repeat > 1) {
          this.repeat -= 1;
          await this.run(({ dataExt = this.dataExt, selectorsExt = this.selectorsExt, ...inputArgs } = {}), envsId);
        }

        // TIMER IN CONSOLE
        if (PPD_LOG_EXTEND) {
          await logger.log({
            text: `🕝: ${new Date() - startTime} ms. (${this.name})`,
            level: 'timer',
            levelIndent,
            extendInfo: true,
          });
        }
      } catch (error) {
        const { PPD_DEBUG_MODE = false } = new Arguments();
        error.envsId = error.envsId || envsId;
        error.envs = error.envs || this.envs;
        error.socket = error.socket || this.socket;
        error.debug = error.debug || PPD_DEBUG_MODE;
        error.stepId = error.stepId || this.stepId;
        error.testDescription = error.testDescription || this.description;
        error.message += ` || error in test = ${this.name}`;
        await logger.log({
          level: 'error',
          text: `Description: ${this.description || 'No test description'} (${this.name})`,
          screenshot: false,
          stepId: this.stepId,
          funcFile: this.funcFile,
          testFile: this.testFile,
          levelIndent: this.levelIndent,
          error,
        });
        await this.errorTest();
        throw error;
      }
    };

    this.run = async ({ dataExt = [], selectorsExt = [], ...inputArgs } = {}, envsId) => {
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
              await this.runLogic(({ dataExt = [], selectorsExt = [], ...inputArgs } = {}), envsId);
              resolve();
            }
          });
        });
      }
      return this.runLogic(({ dataExt = [], selectorsExt = [], ...inputArgs } = {}), envsId);
    };
  }
}

module.exports = Test;
