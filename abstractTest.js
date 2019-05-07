const fs = require('fs');

const _ = require('lodash');
const safeEval = require('safe-eval');
const deepmerge = require('deepmerge');
const yaml = require('js-yaml');

const {
  Helpers,
  overwriteMerge,
  resolveStars
} = require('./helpers');

const checkNeedEnv = (needEnvs, envName) => {
  needEnvs = _.isString(needEnvs) ? [needEnvs] : needEnvs;

  if (_.isArray(needEnvs)) {
    if (needEnvs.length && !needEnvs.includes(envName)) {
      throw {
        message: `Wrong Environment, local current env = ${envName}, but test pass needEnvs = ${needEnvs}`,
      };
    }
  } else {
    throw {
      message: 'needEnv wrong format, shoud be array or string'
    };
  }
};

const resolveAliases = (valueName, otherValues, parentValue = {}, defaultValue = {}) => {
  const ALIASSES = {
    bindData: ['bD', 'bd'],
    bindSelectors: ['bindSelector', 'bS', 'bs'],
    bindResults: ['bindResult', 'bR', 'br'],
    selectors: ['selector', 's'],
    data: ['d'],
    results: ['result', 'r'],
    options: ['option', 'opt', 'o'],
    selectorsFunction: ['selectorFunction', 'sF', 'sf'],
    dataFunction: ['dF', 'df'],
  };

  let result = deepmerge.all([defaultValue, parentValue], {
    arrayMerge: overwriteMerge
  });

  const aliasses = [valueName, ..._.get(ALIASSES, valueName, [])];
  aliasses.forEach(v => {
    result = deepmerge.all([result, _.get(otherValues, v, {})], {
      arrayMerge: overwriteMerge
    });
  });

  return result;
};

//TODO: 2019-05-06 S.Starodubov Нужен полный рефакторинг двух этих функций
const fetchData = (env, envs, extFiles) => {
  let dataLocal = deepmerge.all(
    [{},
      env ? env.get('data') : {}, //Берем данные из предыдущих тестов
      envs.get('args.extDataExt', {}), // подгруженные из yaml файлов в переменной среды
      envs.get('args.extData', {}), // из переменной среды
      envs.get('data', {}), // из глобального env
      envs.get('resultsFunc', {}), // результаты функций
      envs.get('results', {}), // результаты
    ], {
      arrayMerge: overwriteMerge
    },
  );

  let resolvedExtFiles = resolveStars(extFiles, envs.get('args.testsFolder'));
  resolvedExtFiles.forEach(f => {
    const data_ext = yaml.safeLoad(fs.readFileSync(f, 'utf8'));
    dataLocal = deepmerge.all([dataLocal, data_ext], {
      arrayMerge: overwriteMerge,
    });
  });

  return dataLocal;
}

const fetchSelectors = (env, envs, extFiles) => {
  let selectorsLocal = deepmerge.all(
    [{},
      env ? env.get('selectors') : {},
      envs.get('args.extSelectorsExt', {}),
      envs.get('args.extSelectors', {}),
      envs.get('selectors', {}),
      envs.get('resultsFunc', {}),
      envs.get('results', {}),
    ], {
      arrayMerge: overwriteMerge
    },
  );

  resolvedExtFiles = resolveStars(extFiles, envs.get('args.testsFolder'));
  resolvedExtFiles.forEach(f => {
    const data_ext = yaml.safeLoad(fs.readFileSync(f, 'utf8'));
    selectorsLocal = deepmerge.all([selectorsLocal, data_ext], {
      arrayMerge: overwriteMerge,
    });
  });
  return selectorsLocal;
}

class Test {
  constructor({
    // Имя теста
    // На базе имени ищутся данные в data в частности data[name]
    name,

    // Тип теста atom, test, multiEnv?
    // Если atom то обязательный прямой проброс данных
    type = 'test',

    // Доступные типы env
    // Если тест работает с несколькими env то проверять входные env
    // и активную на совпадение с этим делом
    needEnv = [],
    needData = [],
    needSelectors = [],
    allowResults = [],

    dataExt = [],
    selectorsExt = [],

    // Биндинги селекторов
    // 1. Смотрим на локальные данные this.selectors
    // 2. Смотрим на данные в глобальной env.selectors
    // 3. Смотрим на данные в env[envName].selectors

    // {} - данные
    //TODO: 2018-07-02 S.Starodubov repeat
    // [{}] - много данных для посторения repeat
    // Колличество повторений
    repeat = 1,

    beforeTest = async function () {},
    runTest = async function () {},
    afterTest = async function () {},
    errorTest = async function () {},

    source = '',
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

    this.repeat = repeat;
    this.source = source;

    this.data = resolveAliases('data', constructorArgs);
    this.selectors = resolveAliases('selectors', constructorArgs);
    this.results = resolveAliases('results', constructorArgs);
    this.options = resolveAliases('options', constructorArgs);
    this.bindData = resolveAliases('bindData', constructorArgs);
    this.bindSelectors = resolveAliases('bindSelectors', constructorArgs);
    this.bindResults = resolveAliases('bindResults', constructorArgs);
    this.selectorsFunction = resolveAliases('selectorsFunction', constructorArgs);
    this.dataFunction = resolveAliases('dataFunction', constructorArgs);

    this.run = async ({
        dataExt = [],
        selectorsExt = [],
        ...inputArgs
        // envName,
        // repeat,
      } = {},
      envsId,
    ) => {

      let data = resolveAliases('data', inputArgs, this.data);
      let selectors = resolveAliases('selectors', inputArgs, this.selectors);
      let options = resolveAliases('options', inputArgs, this.options);
      let bindDataLocal = resolveAliases('bindData', inputArgs, this.bindData);
      let bindSelectorsLocal = resolveAliases('bindSelectors', inputArgs, this.bindSelectors);
      let selectorsFunctionLocal = resolveAliases('selectorsFunction', inputArgs, this.selectorsFunction);
      let dataFunctionLocal = resolveAliases('dataFunction', inputArgs, this.dataFunction);

      let results = resolveAliases('results', inputArgs);
      let bindResults = resolveAliases('bindResults', inputArgs);

      dataExt = [...new Set([...this.dataExt, ...dataExt])];
      selectorsExt = [...new Set([...this.selectorsExt, ...selectorsExt])];

      if (!envsId) {
        throw {
          message: 'Test shoud have envsId'
        };
      }

      let {
        envs,
        log
      } = require('./env.js')(envsId);

      try {
        const envName = envs.get('current.name');
        const envPageName = envs.get('current.page');
        const env = envs.get(`envs.${envName}`);
        const browser = env ? env.getState('browser') : null;
        //TODO: 2018-07-03 S.Starodubov если нет page то может это API
        const page = env ? env.getState(`pages.${envPageName}`) : null;

        checkNeedEnv(this.needEnv, envName);

        let dataLocal = fetchData(env, envs, dataExt);
        for (const key in bindDataLocal) {
          dataLocal[key] = _.get(dataLocal, bindDataLocal[key]);
        }
        // Добавляем данные самого теста после всех биндингов
        dataLocal = deepmerge.all([dataLocal, data], {
          arrayMerge: overwriteMerge
        });

        let selectorsLocal = fetchSelectors(env, envs, selectorsExt);
        for (const key in bindSelectorsLocal) {
          selectorsLocal[key] = _.get(selectorsLocal, bindSelectorsLocal[key]);
        }
        selectorsLocal = deepmerge.all([selectorsLocal, selectors], {
          arrayMerge: overwriteMerge
        });

        // FUNCTIONS
        let allDataAndSelectors = deepmerge.all([dataLocal, selectorsLocal], {
          arrayMerge: overwriteMerge,
        });

        let dataFunctionForGlobalResults = {};

        for (const key in dataFunctionLocal) {
          if (_.isString(dataFunctionLocal[key])) {
            dataLocal[key] = safeEval(dataFunctionLocal[key], allDataAndSelectors);
            dataFunctionForGlobalResults[key] = dataLocal[key];
          }
          if (_.isArray(dataFunctionLocal[key]) && dataFunctionLocal[key].length == 2) {
            let dataFuncEval = safeEval(dataFunctionLocal[key][0], allDataAndSelectors);
            dataLocal[key] = dataFuncEval;
            dataLocal[dataFunctionLocal[key][1]] = dataFuncEval;
            dataFunctionForGlobalResults[key] = dataFuncEval;
            dataFunctionForGlobalResults[dataFunctionLocal[key][1]] = dataFuncEval;
          }
        }

        let selectorsFunctionForGlobalResults = {};

        for (const key in selectorsFunctionLocal) {
          if (_.isString(selectorsFunctionLocal[key])) {
            selectorsLocal[key] = safeEval(selectorsFunctionLocal[key], allDataAndSelectors);
            selectorsFunctionForGlobalResults[key] = selectorsLocal[key];
          }
          if (_.isArray(selectorsFunctionLocal[key]) && selectorsFunctionLocal[key].length == 2) {
            let selectorsFuncEval = safeEval(selectorsFunctionLocal[key][0], allDataAndSelectors);
            selectorsLocal[key] = selectorsFuncEval;
            selectorsLocal[selectorsFunctionLocal[key][1]] = selectorsFuncEval;
            selectorsFunctionForGlobalResults[key] = selectorsFuncEval;
            selectorsFunctionForGlobalResults[selectorsFunctionLocal[key][1]] = selectorsFuncEval;
          }
        }

        // Сохраняем функции в результаты
        envs.set('resultsFunc', deepmerge(envs.get('resultsFunc', {}), dataFunctionForGlobalResults));
        envs.set('resultsFunc', deepmerge(envs.get('resultsFunc', {}), selectorsFunctionForGlobalResults));

        // Write data to local env. For child tests.
        if (env) {
          env.set('env.data', dataLocal);
          env.set('env.selectors', selectorsLocal);
        }

        // CHECK NEED
        // [['data', 'd'], 'another', 'optional?']
        _.forEach(needData, d => {
          const keysData = new Set(Object.keys(dataLocal));
          if (_.isString(d) && d.endsWith('?')) return; // optional parametr
          const keysDataIncome = new Set(_.isString(d) ? [d] : d);
          const intersectionData = new Set([...keysData].filter(x => keysDataIncome.has(x)));
          if (!intersectionData.size) {
            throw {
              message: `Error: can't find data parametr "${d}" in ${this.name} test`,
            };
          }
        });

        _.forEach(needSelectors, d => {
          const keysSelectors = new Set(Object.keys(selectorsLocal));
          if (_.isString(d) && d.endsWith('?')) return; // optional parametr
          const keysSelectorsIncome = new Set(_.isString(d) ? [d] : d);
          const intersectionSelectors = new Set([...keysSelectors].filter(x => keysSelectorsIncome.has(x)));
          if (!intersectionSelectors.size) {
            throw {
              message: `Error: can't find selector "${d}" in ${this.name} test`,
            };
          }
        });

        //TODO: 2019-05-07 S.Starodubov все эти ифы надо еще сделать в конец когда уже есть результаты типа ifResults сделать
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
            throw {
              message: `Test stoped with error = ${errorExpr}`,
            };
          }
        }

        // BIND RESULTS
        let bindResultsLocal = {};
        bindResultsLocal = deepmerge.all(
          [
            this.bindResults,
            bindResults,
            results,
          ], {
            arrayMerge: overwriteMerge
          },
        );

        let resultFromTest = {};

        // Bind source of test in log function
        let allowResults = this.allowResults;

        function bind(func, source) {
          return function () {
            return func.apply(this, [
              ...arguments,
              source,
              {
                envName,
                envPageName,
                // env,
                // browser,
                // page,
                data: dataLocal,
                selectors: selectorsLocal,
                allowResults: allowResults,
                results: bindResultsLocal,
                options,
                envsId,
              },
            ]);
          };
        };

        let logBinded = bind(log, this);

        //TODO: 2018-07-03 S.Starodubov проверки на существование всего этого, чтобы не проверять в самом тесте
        // если что ронять с исключнием
        const args = {
          envName,
          envPageName,
          env,
          browser,
          page,
          data: dataLocal,
          selectors: selectorsLocal,
          allowResults: this.allowResults,
          options,
          envsId,
          envs,
          log: logBinded,
          helper: new Helpers(),
          _,
        };

        // RUN FUNCTIONS
        const FUNCTIONS = [this.beforeTest, this.runTest, this.afterTest];

        for (let i = 0; i < FUNCTIONS.length; i++) {
          let funcs = FUNCTIONS[i];

          if (_.isFunction(funcs)) {
            funcs = [funcs];
          }
          if (_.isArray(funcs)) {
            for (const fun of funcs) {
              let funResult = (await fun(args)) || {};
              resultFromTest = deepmerge.all([resultFromTest, funResult], {
                arrayMerge: overwriteMerge,
              });
            }
          }
        }

        // Удаление локальных данных для устранения дублирования старых при обшибке когда несколько значени в [selector, sel, s]
        // let needDataToRemove = _.flattenDeep(needData);
        // let needSelectorsToRemove = _.flattenDeep(needSelectors);
        // _.forEach(needDataToRemove, v => {
        //   try {
        //     delete dataLocal[v]
        //   } catch(err){}
        // })
        // _.forEach(needSelectorsToRemove, v => {
        //   try {
        //     delete selectorsLocal[v]
        //   } catch(err){}
        // })

        // todo
        // выкидывать предупреждение если пришло в результатах то чего нет в allowResults
        // или если не пришло то чего нужно

        // RESULTS

        // Результаты которые пришли из внутренностей теста
        Object.keys(resultFromTest).forEach(key => {
          let bindKey = _.get(bindResultsLocal, key);
          if (bindKey && this.allowResults.includes(key)) {
            envs.set(`results.${bindKey}`, resultFromTest[key]);
          }
        });

        // envs.set('results', deepmerge.all([envs.get('results'), resultFromTest], { arrayMerge: overwriteMerge }));

        // Результаты которые просто просто хочется забиндить в переменную, а не приходящие из теста
        Object.keys(bindResultsLocal).forEach(key => {
          let bindKey = _.get(bindResultsLocal, key);
          const availableData = deepmerge.all([envs.get('results'), dataLocal, selectorsLocal, resultFromTest], {
            arrayMerge: overwriteMerge,
          });
          envs.set(`results.${bindKey}`, _.get(availableData, key));
        });
      } catch (err) {
        err.envsId = envsId;
        log({
          level: 'error',
          text: `Test ${this.name} = ${err.message}`,
          screenshot: false,
        });
        await errorTest();
        console.log(err);
        throw err;
      }
    };

    // this.canReuse; // Есть ли зависимости от окружения, типа переключений.
  }
}

module.exports = Test;