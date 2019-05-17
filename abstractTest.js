const fs = require('fs');

const _ = require('lodash');
const safeEval = require('safe-eval');
const deepmerge = require('deepmerge');
const yaml = require('js-yaml');

const { Helpers, overwriteMerge, resolveStars } = require('./helpers');

function bind(func, source, bindArgs) {
  return function() {
    return func.apply(this, [...arguments, source, bindArgs]);
  };
}

const checkNeeds = (needs, data, testName) => {
  // [['data', 'd'], 'another', 'optional?']
  const keysData = new Set(Object.keys(data));
  _.forEach(needs, d => {
    if (_.isString(d) && d.endsWith('?')) return; // optional parametr
    const keysDataIncome = new Set(_.isString(d) ? [d] : d);
    const intersectionData = new Set([...keysData].filter(x => keysDataIncome.has(x)));
    if (!intersectionData.size) {
      throw { message: `Error: can't find data parametr "${d}" in ${testName} test` };
    }
  });
  return;
};

const resolveDataFunctions = (funcParams, dataLocal, selectorsLocal) => {
  const allDataSel = deepmerge.all([dataLocal, selectorsLocal], { arrayMerge: overwriteMerge });
  let funcEval = {};

  for (const key in funcParams) {
    if (_.isString(funcParams[key])) {
      funcEval[key] = safeEval(funcParams[key], allDataSel);
    }
    //TODO: 2019-05-17 S.Starodubov Убрать эту возможность делать присвоение через функции
    if (_.isArray(funcParams[key]) && funcParams[key].length == 2) {
      let dataFuncEval = safeEval(funcParams[key][0], allDataSel);
      funcEval[key] = dataFuncEval;
      funcEval[funcParams[key][1]] = dataFuncEval;
    }
  }
  return funcEval;
};

class Test {
  constructor({
    name,
    type = 'test', // atom, test, multiEnv?
    levelIndent = 0,
    needEnv = [],
    needData = [],
    needSelectors = [],
    allowResults = [],
    dataExt = [],
    selectorsExt = [],
    beforeTest = async function() {},
    runTest = async function() {},
    afterTest = async function() {},
    errorTest = async function() {},
    source = '',
    repeat = 1,
    ...constructorArgs
  } = {}) {
    this.name = name;
    this.type = type;
    this.needEnv = needEnv;
    this.needData = needData;
    this.needSelectors = needSelectors;
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

    this.ALIASSES = {
      bindData: ['bD', 'bd'],
      bindSelectors: ['bindSelector', 'bS', 'bs'],
      bindResults: ['bindResult', 'bR', 'br', 'result', 'r'],
      selectors: ['selector', 's'],
      data: ['d'],
      options: ['option', 'opt', 'o'],
      selectorsFunction: ['selectorFunction', 'sF', 'sf'],
      dataFunction: ['dF', 'df'],
    };

    this.resolveAliases = (valueName, constructorValues, testValues) => {
      let result = {};
      const aliasses = [valueName, ..._.get(this.ALIASSES, valueName, [])];
      aliasses.forEach(v => {
        result = deepmerge.all([result, _.get(constructorValues, v, {}), _.get(testValues, v, {})], {
          arrayMerge: overwriteMerge,
        });
      });
      return result;
    };

    this.checkNeedEnv = () => {
      const needEnvs = _.isString(this.needEnv) ? [this.needEnv] : this.needEnv;
      if (_.isArray(needEnvs)) {
        if (needEnvs.length && !needEnvs.includes(this.envName)) {
          throw {
            message: `Wrong Environment, local current env = ${this.envName}, but test pass needEnvs = ${needEnvs}`,
          };
        }
      } else {
        throw { message: 'needEnv wrong format, shoud be array or string' };
      }
    };

    this.fetchData = (isSelector = false) => {
      let dataLocal, joinArray;
      const extFiles = isSelector ? this.selectorsExt : this.dataExt;
      const bindDataLocal = isSelector ? this.bindSelectors : this.bindData;
      const data = isSelector ? this.selectors : this.data;

      // 1. Get data from previous tests
      // 2. Get data from yaml files in env passed
      // 3. Get data from ENV params global
      // 4. Get data from global env for all tests
      // 5. Get data from user function results
      // 6. Get data from results
      if (isSelector) {
        joinArray = [
          this.env ? this.env.get('selectors') : {},
          this.envs.get('args.extSelectorsExt', {}),
          this.envs.get('args.extSelectors', {}),
          this.envs.get('selectors', {}),
        ];
      } else {
        joinArray = [
          this.env ? this.env.get('data') : {},
          this.envs.get('args.extDataExt', {}),
          this.envs.get('args.extData', {}),
          this.envs.get('data', {}),
        ];
      }
      joinArray = [...joinArray, this.envs.get('resultsFunc', {}), this.envs.get('results', {})];

      // 7. Fetch data from ext files that passed in test itself
      let resolvedExtFiles = resolveStars(extFiles, this.envs.get('args.testsFolder'));
      resolvedExtFiles.forEach(f => {
        const data_ext = yaml.safeLoad(fs.readFileSync(f, 'utf8'));
        joinArray = [...joinArray, data_ext];
      });

      dataLocal = deepmerge.all(joinArray, { arrayMerge: overwriteMerge });

      // 8. Update local data with bindings
      for (const key in bindDataLocal) {
        dataLocal[key] = _.get(dataLocal, bindDataLocal[key]);
      }

      // 9. Update after all bindings with raw data from test itself
      dataLocal = deepmerge.all([dataLocal, data], { arrayMerge: overwriteMerge });

      return dataLocal;
    };

    this.fetchSelectors = () => {
      return this.fetchData(true);
    };

    this.run = async ({ dataExt = [], selectorsExt = [], ...inputArgs } = {}, envsId) => {
      this.data = this.resolveAliases('data', inputArgs, constructorArgs);
      this.bindData = this.resolveAliases('bindData', inputArgs, constructorArgs);
      this.selectors = this.resolveAliases('selectors', inputArgs, constructorArgs);
      this.bindSelectors = this.resolveAliases('bindSelectors', inputArgs, constructorArgs);
      this.options = this.resolveAliases('options', inputArgs, constructorArgs);
      this.dataFunction = this.resolveAliases('dataFunction', inputArgs, constructorArgs);
      this.selectorsFunction = this.resolveAliases('selectorsFunction', inputArgs, constructorArgs);
      this.bindResults = this.resolveAliases('bindResults', inputArgs, constructorArgs);
      this.dataExt = [...new Set([...this.dataExt, ...dataExt])];
      this.selectorsExt = [...new Set([...this.selectorsExt, ...selectorsExt])];
      this.repeat = _.get(inputArgs, 'repeat') || _.get(constructorArgs, 'repeat') || this.repeat;

      if (!envsId) {
        throw { message: 'Test shoud have envsId' };
      }

      let { envs, log } = require('./env.js')(envsId);

      try {
        // Descriptions in log
        log({
          screenshot: false,
          text: _.get(inputArgs, 'description', `(${this.name}) TODO: Fill description`),
          level: 'test',
          levelIndent,
        });

        this.envs = envs;
        this.envName = this.envs.get('current.name');
        this.envPageName = this.envs.get('current.page');
        this.env = this.envs.get(`envs.${this.envName}`);

        this.checkNeedEnv();

        let dataLocal = this.fetchData();
        let selectorsLocal = this.fetchSelectors();

        // FUNCTIONS
        let dataFunctionForGlobalResults = resolveDataFunctions(this.dataFunction, dataLocal, selectorsLocal);
        dataLocal = deepmerge.all([dataLocal, dataFunctionForGlobalResults], { arrayMerge: overwriteMerge });

        let selectorsFunctionForGlobalResults = resolveDataFunctions(this.selectorsFunction, dataLocal, selectorsLocal);
        selectorsLocal = deepmerge.all([selectorsLocal, selectorsFunctionForGlobalResults], {
          arrayMerge: overwriteMerge,
        });

        // Сохраняем функции в результаты
        this.envs.set('resultsFunc', deepmerge(this.envs.get('resultsFunc', {}), dataFunctionForGlobalResults));
        this.envs.set('resultsFunc', deepmerge(this.envs.get('resultsFunc', {}), selectorsFunctionForGlobalResults));

        // Write data to local env. For child tests.
        if (this.env) {
          this.env.set('env.data', dataLocal);
          this.env.set('env.selectors', selectorsLocal);
        }

        checkNeeds(needData, dataLocal, this.name);
        checkNeeds(needSelectors, selectorsLocal, this.name);

        // IF
        let expr = _.get(inputArgs, 'if');
        if (expr) {
          let exprResult = safeEval(expr, dataLocal);
          if (!exprResult) {
            return;
          }
        }

        // ERROR
        let errorExpr = _.get(inputArgs, 'errorIf');
        if (errorExpr) {
          let exprResult = false;

          try {
            exprResult = safeEval(errorExpr, dataLocal);
          } catch (err) {
            if (err.name == 'ReferenceError') {
              await log({
                level: 'error',
                screenshot: true,
                fullpage: true,
                text: `errorIf can't evaluate = ${err.message}`,
              });
            } else {
              throw err;
            }
          }

          if (exprResult) {
            await log({
              level: 'error',
              screenshot: true,
              fullpage: true,
              text: `Test stoped with error = ${errorExpr}`,
            });
            throw { message: `Test stoped with error = ${errorExpr}` };
          }
        }

        // All data passed to log
        const args = {
          envsId,
          envName: this.envName,
          envPageName: this.envPageName,
          data: dataLocal,
          selectors: selectorsLocal,
          options: this.options,
          allowResults: this.allowResults,
          bindResults: this.bindResults,
          levelIndent: this.levelIndent,
          repeat: this.repeat,
        };

        // Extend with data passed to functions
        const args_ext = Object.assign({}, args, {
          env: this.env,
          envs: this.envs,
          browser: this.env ? this.env.getState('browser') : null,
          // If there is no page it`s might be API
          page: this.env ? this.env.getState(`pages.${this.envPageName}`) : null,
          log: bind(log, source, args),
          helper: new Helpers(),
          _,
        });

        // RUN FUNCTIONS
        const FUNCTIONS = [this.beforeTest, this.runTest, this.afterTest];
        let resultFromTest = {};

        for (let i = 0; i < FUNCTIONS.length; i++) {
          let funcs = FUNCTIONS[i];

          if (_.isFunction(funcs)) {
            funcs = [funcs];
          }
          if (_.isArray(funcs)) {
            for (const fun of funcs) {
              let funResult = (await fun(args_ext)) || {};
              resultFromTest = deepmerge.all([resultFromTest, funResult], { arrayMerge: overwriteMerge });
            }
          }
        }

        // RESULTS
        // TODO: выкидывать предупреждение если не пришло то чего нужно в результатах то чего в allowResults
        let results = _.pick(resultFromTest, allowResults);

        if (Object.keys(results).length && Object.keys(results).length != [...new Set(allowResults)].length) {
          throw { message: 'Can`t get results from test' };
        }

        for (const key in this.bindResults) {
          results[key] = _.get(results, this.bindResults[key]);
        }

        envs.set('results', deepmerge.all([envs.get('results'), results], { arrayMerge: overwriteMerge }));

        if (this.repeat > 1) {
          this.repeat -= 1;
          await this.run(({ dataExt = [], selectorsExt = [], ...inputArgs } = {}), envsId);
        }
      } catch (err) {
        err.envsId = envsId;
        log({
          level: 'error',
          text: `Test ${this.name} = ${err.message}`,
          screenshot: false,
        });
        await this.errorTest();
        console.log(err);
        throw err;
      }
    };
  }
}

module.exports = Test;
