const fs = require('fs');

const _ = require('lodash');
const safeEval = require('safe-eval');
const yaml = require('js-yaml');

const { Helpers, merge } = require('./helpers');

function bind(func, source, bindArgs) {
  return function() {
    return func.apply(this, [...arguments, source, bindArgs]);
  };
}

const ALIASSES = {
  bindData: ['bD', 'bd'],
  bindSelectors: ['bindSelector', 'bS', 'bs'],
  bindResults: ['bindResult', 'bR', 'br', 'result', 'r'],
  selectors: ['selector', 's'],
  data: ['d'],
  options: ['option', 'opt', 'o'],
  selectorsFunction: ['selectorFunction', 'sF', 'sf'],
  dataFunction: ['dF', 'df'],
  resultFunction: ['rF', 'rf'],
};

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

const resolveDataFunctions = (funcParams, dataLocal, selectorsLocal = {}) => {
  const allDataSel = merge(dataLocal, selectorsLocal);
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

const resolveAliases = (valueName, inputs = {}, aliasses = {}) => {
  try {
    let result = {};
    const values = [valueName, ..._.get(aliasses, valueName, [])];
    values.forEach(v => {
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
      throw {
        message: `Wrong Environment, local current env = ${envName}, but test pass needEnvs = ${needEnvs}`,
      };
    }
  } else {
    throw { message: 'needEnv wrong format, shoud be array or string' };
  }
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
    socket = null,
    stepId = null,
    breadcrumbs = [],
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
    this.socket = socket;
    this.stepId = stepId;
    this.breadcrumbs = breadcrumbs;
    this.funcFile = constructorArgs.funcFile;
    this.testFile = constructorArgs.testFile;

    this.fetchData = (isSelector = false) => {
      const resolveStars = function(linksArray, rootFolder = '.') {
        let resolvedArray = [];
        if (!_.isArray(linksArray)) return resolvedArray;
        linksArray.forEach(fileName => {
          if (fileName.endsWith('*')) {
            let fileMask = _.trimEnd(fileName, '*').replace(/\\/g, '\\\\');
            fileMask = _.trimEnd(fileMask, '/');
            fileMask = _.trimEnd(fileMask, '\\\\');
            const fullFileMask = path.join(rootFolder, fileMask);
            let paths = walkSync(fullFileMask);
            let pathsClean = _.map(paths, v => {
              if (v.endsWith('/') || v.endsWith('\\')) return false;
              return path.join(fullFileMask, v);
            }).filter(v => v);
            resolvedArray = [...resolvedArray, ...pathsClean];
          } else {
            resolvedArray.push(path.join(rootFolder, fileName));
          }
        });
        resolvedArray = resolvedArray.map(v => (v.endsWith('.yaml') ? v : v + '.yaml'));
        return resolvedArray;
      };

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
          // this.envs.get('args.extSelectorsExt', {}),
          // this.envs.get('args.extSelectors', {}),
          this.envs.get('selectors', {}),
        ];
      } else {
        joinArray = [
          this.env ? this.env.get('data') : {},
          // this.envs.get('args.extDataExt', {}),
          // this.envs.get('args.extData', {}),
          this.envs.get('data', {}),
        ];
      }
      joinArray = [...joinArray, this.envs.get('resultsFunc', {}), this.envs.get('results', {})];

      // 7. Fetch data from ext files that passed in test itself
      let resolvedExtFiles = resolveStars(extFiles, this.envs.get('args.PPD_ROOT'));
      resolvedExtFiles.forEach(f => {
        const data_ext = yaml.safeLoad(fs.readFileSync(f, 'utf8'));
        if (['data', 'selectors'].includes(_.get(data_ext, 'type'))) {
          joinArray = [...joinArray, data_ext];
        } else {
          throw { message: 'Ext Data file not typed. Include "type: data (selectors)" atribute' };
        }
      });

      dataLocal = merge(...joinArray);

      // 8. Update local data with bindings
      for (const key in bindDataLocal) {
        dataLocal[key] = _.get(dataLocal, bindDataLocal[key]);
      }

      // 9. Update after all bindings with raw data from test itself
      dataLocal = merge(dataLocal, data);

      return dataLocal;
    };

    this.fetchSelectors = () => {
      return this.fetchData(true);
    };

    this.collectDebugData = (error, locals = {}, message = null) => {
      error.test = {
        data: this.data,
        bindData: this.bindData,
        dataFunction: this.dataFunction,
        dataExt: this.dataExt,
        selectors: this.selectors,
        bindSelectors: this.bindSelectors,
        selectorsFunction: this.selectorsFunction,
        selectorsExt: this.selectorsExt,
        bindResults: this.bindResults,
        resultFunction: this.resultFunction,
        options: this.options,
        repeat: this.repeat,
        while: this.while,
        if: this.if,
        errorIf: this.errorIf,
        errorIfResult: this.errorIfResult,
      };
      error.testLocal = locals;
      if (message) {
        error.message = message;
      }
      return error;
    };

    this.run = async ({ dataExt = [], selectorsExt = [], ...inputArgs } = {}, envsId) => {
      const inputs = merge(inputArgs, constructorArgs);

      this.data = resolveAliases('data', inputs, ALIASSES);
      this.bindData = resolveAliases('bindData', inputs, ALIASSES);
      this.dataFunction = resolveAliases('dataFunction', inputs, ALIASSES);
      this.dataExt = [...new Set([...this.dataExt, ...dataExt])];

      this.selectors = resolveAliases('selectors', inputs, ALIASSES);
      this.bindSelectors = resolveAliases('bindSelectors', inputs, ALIASSES);
      this.selectorsFunction = resolveAliases('selectorsFunction', inputs, ALIASSES);
      this.selectorsExt = [...new Set([...this.selectorsExt, ...selectorsExt])];

      this.bindResults = resolveAliases('bindResults', inputs, ALIASSES);
      this.resultFunction = resolveAliases('resultFunction', inputs, ALIASSES);

      this.options = resolveAliases('options', inputs, ALIASSES);
      this.description = _.get(inputArgs, 'description') || _.get(constructorArgs, 'description') || this.description;
      this.repeat = _.get(inputArgs, 'repeat') || _.get(constructorArgs, 'repeat') || this.repeat;
      this.while = _.get(inputArgs, 'while') || _.get(constructorArgs, 'while') || this.while;
      this.if = _.get(inputArgs, 'if') || _.get(constructorArgs, 'if') || this.if;
      this.errorIf = _.get(inputArgs, 'errorIf') || _.get(constructorArgs, 'errorIf') || this.errorIf;
      this.errorIfResult =
        _.get(inputArgs, 'errorIfResult') || _.get(constructorArgs, 'errorIfResult') || this.errorIfResult;

      if (!envsId) {
        throw { message: 'Test shoud have envsId' };
      }

      let { envs, log } = require('./env.js')({ envsId });

      try {
        this.envs = envs;
        this.envName = this.envs.get('current.name');
        this.envPageName = this.envs.get('current.page');
        this.env = this.envs.get(`envs.${this.envName}`);

        checkNeedEnv({ needEnv: this.needEnv, envName: this.envName });

        let dataLocal = this.fetchData();
        let selectorsLocal = this.fetchSelectors();
        let allData = merge(dataLocal, selectorsLocal);

        // FUNCTIONS
        let dFResults = resolveDataFunctions(this.dataFunction, allData);
        let sFResults = resolveDataFunctions(this.selectorsFunction, allData);

        // Сохраняем функции в результаты
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

        // IF
        // TODO: 2019-08-21 S.Starodubov refactor like errorIfResult
        let expr = this.if;
        if (expr) {
          // TODO: 2019-07-18 S.Starodubov ReferenceError
          let exprResult = safeEval(expr, merge(dataLocal, selectorsLocal));
          if (!exprResult) {
            await log({
              level: 'info',
              screenshot: false,
              fullpage: false,
              text: 'If skiping',
            });
            return;
          }
        }

        // TODO: 2019-08-21 S.Starodubov refactor like errorIfResult
        // ERROR
        let errorExpr = this.errorIf;
        if (errorExpr) {
          let exprResult = false;

          try {
            exprResult = safeEval(errorExpr, merge(dataLocal, selectorsLocal));
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
          stepId: this.stepId,
        };

        let logBinded = bind(log, source, args);

        // Extend with data passed to functions
        const args_ext = Object.assign({}, args, {
          env: this.env,
          envs: this.envs,
          browser: this.env ? this.env.getState('browser') : null,
          // If there is no page it`s might be API
          page: this.env ? this.env.getState(`pages.${this.envPageName}`) : null,
          log: logBinded,
          helper: new Helpers(),
          _,
        });

        // Descriptions in log
        logBinded({
          screenshot: false,
          text: this.description || `(${this.name}) TODO: Fill description`,
          level: 'test',
          levelIndent,
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
              // resultFromTest = merge(dataLocal, selectorsLocal, resultFromTest, funResult);
              resultFromTest = merge(resultFromTest, funResult);
            }
          }
        }

        // RESULTS
        // TODO: выкидывать предупреждение если не пришло то чего нужно в результатах то чего в allowResults
        let results = _.pick(resultFromTest, allowResults);
        let localResults = {};

        if (Object.keys(results).length && Object.keys(results).length != [...new Set(allowResults)].length) {
          throw { message: 'Can`t get results from test' };
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
          let resultFunction = resolveDataFunctions(this.resultFunction, dataWithResults);
          dataLocal = merge(dataLocal, resultFunction);
          selectorsLocal = merge(selectorsLocal, resultFunction);
          localResults = merge(localResults, resultFunction);
          envs.set('results', merge(envs.get('results'), localResults));
        }

        // ERROR
        if (this.errorIfResult) {
          let exprResult = false;

          try {
            exprResult = safeEval(this.errorIfResult, merge(dataLocal, selectorsLocal, localResults));
          } catch (err) {
            if (err.name == 'ReferenceError') {
              await log({
                level: 'error',
                screenshot: true,
                fullpage: true,
                text: `errorIfResult can't evaluate = ${err.message}`,
              });
            }
            throw this.collectDebugData(err, { dataLocal, selectorsLocal, localResults, results });
          }
          if (exprResult) {
            await log({
              level: 'error',
              screenshot: true,
              fullpage: true,
              text: `Test stoped with error = ${this.errorIfResult}`,
            });
            throw this.collectDebugData(
              {},
              {
                dataLocal,
                selectorsLocal,
                localResults,
                results,
              },
              `Test stoped with error = ${this.errorIfResult}`,
            );
          }
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
      } catch (error) {
        error.envsId = error.envsId || envsId;
        error.envs = error.envs || this.envs;
        error.socket = error.socket || this.socket;
        error.debug = error.debug || _.get(this.envs, ['args', 'PPD_DEBUG_MODE']);
        error.stepId = error.stepId || this.stepId;
        error.testDescription = error.testDescription || this.description;
        error.message += ` || error in test = ${this.name}`;
        log({
          level: 'error',
          text: `Description: ${this.description} (${this.name})`,
          screenshot: false,
          stepId: this.stepId,
          funcFile: this.funcFile,
          testFile: this.testFile,
        });
        await this.errorTest();
        throw error;
      }
    };
  }
}

module.exports = Test;
