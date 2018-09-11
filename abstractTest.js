const fs = require('fs')

const _ = require('lodash');
const safeEval = require('safe-eval')
const deepmerge = require('deepmerge');

const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray

class Helpers {
  constructor(){}

  async getElement(page, selector){
    if (page && selector && _.isString(selector) && _.isObject(page)){
      let element;
      if (selector.startsWith('xpath:')){
        selector = _.trimStart(selector, 'xpath:');
        element = await page.$x(selector);
        if (element.length > 1) {
          throw({
            message: `Finded more then 1 xpath elements ${selector}`
          })
        }
        element = element[0];      }
      else {
        selector = _.trimStart(selector, 'css:');
        element = await page.$(selector);
      }
      return element;
    }
    else {
      return false;
    }
  }

  anyGet (object, paths) {
    if (!object || !_.isObject(object) || !paths || (!_.isString(paths) && !_.isArray(paths))){
      debugger
      throw({
        message: `anyGet error`
      })
    }

    let result;
    if (_.isString(paths)){
      result = _.get(object, paths);
    }

    if (_.isArray(paths)){
      paths.forEach(s => {
        if (_.get(object, s)){
          result = _.get(object, s);
        }
      })
    }

    return result;
  }

}

class Test {
  constructor(
    {

      // Имя теста
      // На базе имени ищутся данные в data в частности data[name]
      name,

      // Тип теста atom, test, multiEnv
      // Если atom то обязательный прямой проброс данных
      type = 'test',

      // ДОступные типы env
      // Если тест работает с несколькими env то проверять входные env
      // и активную на совпадение с этим делом
      needEnv = [],
      needData = [],
      needSelectors = [],
      allowResults = [],

      // Прямой проброс данных
      // {} - данные
      //TODO: 2018-07-02 S.Starodubov repeat
      // [{}] - много данных для посторения repeat
      data = {},
      d = {}, // alias for data
      // Биндинги даты
      //  Смотрим на локальные данные this.data
      //  Смотрим на данные в env[envName].data
      //  Смотрим на данные в глобальной env.data
      //  Смотрим на данные в глобальной env.results
      bindData = {},
      bD = {}, // alias for bindData
      bd = {}, // alias for bindData

      options = {},

      // Прямой проброс селекторов
      selectors = {},
      selector = {}, // alias for selectors
      s = {}, // alias for selectors
      // Биндинги селекторов
      // 1. Смотрим на локальные данные this.selectors
      // 2. Смотрим на данные в глобальной env.selectors
      // 3. Смотрим на данные в env[envName].selectors
      bindSelectors = {},
      bindSelector = {}, // alias for bindSelectors
      bS = {}, // alias for bindSelectors
      bs = {}, // alias for bindSelectors

      bindResults = {},
      bindResult = {}, // alias for bindResults
      bR = {}, // alias for bindResults
      br = {}, // alias for bindResults
      results = {}, // alias for bindResults
      result = {}, // alias for bindResults
      r = {}, // alias for bindResults

      dataFunction = {},
      dF = {}, // alias for dataFunction
      df = {}, // alias for dataFunction
      selectorsFunction = {},
      selectorFunction = {}, // alias for selectorsFunction
      sF = {}, // alias for selectorsFunction
      sf = {}, // alias for selectorsFunction

      // Колличество повторений
      repeat = 1,

      beforeTest = async function(){},
      runTest = async function(){},
      afterTest = async function(){},
      errorTest = async function(){},
    } = {}
  ){
    this.name = name;
    this.type = type;

    this.needEnv = needEnv;
    this.needData = needData;
    this.needSelectors = needSelectors;

    this.data = data;
    this.d = d;

    this.bindData = bindData;
    this.bD = bD;
    this.bd = bd;

    this.options = options;

    this.selectors = selectors;
    this.selector = selector;
    this.s = s;

    this.bindSelectors = bindSelectors;
    this.bindSelector = bindSelector;
    this.bS = bS;
    this.bs = bs;

    this.allowResults = allowResults;

    this.bindResults = bindResults;
    this.bindResult = bindResult;
    this.bR = bR;
    this.br = br;
    this.results = results;
    this.result = result;
    this.r = r;

    this.dataFunction = dataFunction;
    this.dF = dF;
    this.df = df;
    this.selectorsFunction = selectorsFunction;
    this.selectorFunction = selectorFunction;
    this.sF = sF;
    this.sf = sf;

    this.beforeTest = beforeTest;
    this.runTest = runTest;
    this.afterTest = afterTest;

    this.repeat = repeat;

    this.run = async (
      {
        data = {},
        d = {}, // alias for data

        selectors = {},
        selector = {}, // alias for selectors
        s = {}, // alias for selectors

        options = {},

        bindData = {},
        bD = {}, // alias for bindData
        bd = {}, // alias for bindData

        bindSelectors = {},
        bindSelector = {}, // alias for bindSelectors
        bS = {}, // alias for bindSelectors
        bs = {}, // alias for bindSelectors

        bindResults = {},
        bindResult = {}, // alias for bindResults
        bR = {}, // alias for bindResults
        br = {}, // alias for bindResults
        results = {}, // alias for bindResults
        result = {}, // alias for bindResults
        r = {}, // alias for bindResults

        dataFunction = {},
        dF = {}, // alias for dataFunction
        df = {}, // alias for dataFunction

        selectorsFunction = {},
        selectorFunction = {}, // alias for selectorsFunction
        sF = {}, // alias for selectorsFunction
        sf = {}, // alias for selectorsFunction

        ...inputArgs
      // envName,
      // repeat,
      } = {},

      envsId,
    ) => {

      if (!envsId){
        throw({
          message: 'Test needs envsId'
        })
      }

      let { envs, log } = require('./env.js')(envsId);

      try {

        // CURRENT ENV
        const envName = envs.get('current.name');

        if (_.isString(this.needEnv)) {
          this.needEnv = [this.needEnv]
        }
        if (_.isArray(this.needEnv)){
          if (this.needEnv.length && !this.needEnv.includes(envName)){
            throw({message: `Wrong Environment, local env = ${envName}`});
          }
        }
        else {
          throw({message: "needEnv wrong format, need array or string"});
        }

        // CURRENT PAGE NAME
        const envPageName = envs.get('current.page');

        const env = envs.get(`envs.${envName}`);
        const browser = env ? env.getState('browser') : null;
        const page =  env ? env.getState(`pages.${envPageName}`) : null;
        //TODO: 2018-07-03 S.Starodubov если нет page то может это API



        // DATA

        // 1. Берем данные из предыдущих тестов
        let dataLocal = env ? env.get('data') : {};

        // 3. Данные
        // подгруженные из yaml файлов в переменной среды +
        // из переменной среды +
        // из глобального env +
        // результаты
        dataLocal = deepmerge.all([
          dataLocal,
          envs.get('args.extDataExt'),
          envs.get('args.extData'),
          envs.get('data'),
          envs.get('results')
        ], { arrayMerge: overwriteMerge })

        // 4. Биндим данные
        let bindDataLocal = {};
        bindDataLocal = deepmerge.all([
          bindDataLocal,
          this.bindData,
          this.bD,
          this.bd,
          bindData,
          bD,
          bd
        ], { arrayMerge: overwriteMerge })

        for (const key in bindDataLocal){
          dataLocal[key] = _.get(dataLocal, bindDataLocal[key]);
        }

        // 5. Данные самого теста
        dataLocal = deepmerge.all([
          dataLocal,
          this.data,
          this.d,
          data,
          d
        ], { arrayMerge: overwriteMerge })

        // 6. Данные из функций
        let dataFunctionLocal = {};
        dataFunctionLocal = deepmerge.all([
          dataFunctionLocal,
          this.dataFunction,
          this.dF,
          this.df,
          dataFunction,
          dF,
          df
        ], { arrayMerge: overwriteMerge })

        let dataFunctionForGlobalResults = {}

        for (const key in dataFunctionLocal){
          if (_.isString(dataFunctionLocal[key])){
            dataLocal[key] = safeEval(dataFunctionLocal[key], dataLocal);
            dataFunctionForGlobalResults[key] = dataLocal[key];
          }
          if (_.isArray(dataFunctionLocal[key]) && dataFunctionLocal[key].length == 2){
            let dataFuncEval =  safeEval(dataFunctionLocal[key][0], dataLocal);
            dataLocal[key] = dataFuncEval;
            dataLocal[dataFunctionLocal[key][1]] = dataFuncEval;
            dataFunctionForGlobalResults[key] = dataFuncEval;
            dataFunctionForGlobalResults[dataFunctionLocal[key][1]] = dataFuncEval;
          }
        }

        envs.set('results', deepmerge(envs.get('results'), dataFunctionForGlobalResults));

        // Write data to local env. For child tests.
        if (env) {
          env.set('env.data', dataLocal);
        }

        // CHECK NEED DATA
        // [['data', 'd'], 'another', 'optional?']
        _.forEach(needData, d => {
          const keysData = new Set(Object.keys(dataLocal));
          if (_.isString(d) && d.endsWith('?')) return; // optional parametr
          const keysDataIncome = new Set(_.isString(d) ? [d] : d);
          const intersectionData = new Set([...keysData].filter(x => keysDataIncome.has(x)));
          if (!intersectionData.size){
            throw({
              message: `Error: can't find data parametr "${d}" in ${this.name} test`
            })
          }
        })

        // SELECTORS
        let selectorsLocal = {};

        if (page){
          // 1. Берем данные из предыдущих тестов
          selectorsLocal = env ? env.get('selectors') : {};

          // 3. Данные
          // подгруженные из yaml файлов в переменной среды +
          // из переменной среды +
          // из глобального env +
          // результаты
          selectorsLocal = deepmerge.all([
            selectorsLocal,
            envs.get('args.extSelectorsExt'),
            envs.get('args.extSelectors'),
            envs.get('selectors'),
            envs.get('results')
          ], { arrayMerge: overwriteMerge })

          // 4. Биндим данные
          let bindSelectorsLocal = {};
          bindSelectorsLocal = deepmerge.all([
            bindSelectorsLocal,
            this.bindSelectors,
            this.bindSelector,
            this.bS,
            this.bs,
            bindSelectors,
            bindSelector,
            bS,
            bs
          ], { arrayMerge: overwriteMerge })

          for (const key in bindSelectorsLocal){
            selectorsLocal[key] = _.get(selectorsLocal, bindSelectorsLocal[key]);
          }

          // 5. Данные самого теста
          selectorsLocal = deepmerge.all([
            selectorsLocal,
            this.selectors,
            this.selector,
            this.s,
            selectors,
            selector,
            s,
          ], { arrayMerge: overwriteMerge })

          // 6. Данные из функций
          let selectorsFunctionLocal = {};
          selectorsFunctionLocal = deepmerge.all([
            selectorsFunctionLocal,
            this.selectorsFunction,
            this.selectorFunction,
            this.sF,
            this.sf,
            selectorsFunction,
            selectorFunction,
            sF,
            sf
          ], { arrayMerge: overwriteMerge })

          let selectorsFunctionForGlobalResults = {}

          for (const key in selectorsFunctionLocal){
            if (_.isString(selectorsFunctionLocal[key])){
              selectorsLocal[key] = safeEval(selectorsFunctionLocal[key], selectorsLocal)
              selectorsFunctionForGlobalResults[key] = selectorsLocal[key];
            }
            if (_.isArray(selectorsFunctionLocal[key]) && selectorsFunctionLocal[key].length == 2){
              let selectorsFuncEval =  safeEval(selectorsFunctionLocal[key][0], selectorsLocal);
              selectorsLocal[key] = selectorsFuncEval;
              selectorsLocal[selectorsFunctionLocal[key][1]] = selectorsFuncEval;
              selectorsFunctionForGlobalResults[key] = selectorsFuncEval;
              selectorsFunctionForGlobalResults[selectorsFunctionLocal[key][1]] = selectorsFuncEval;
            }
          }

          envs.set('results', deepmerge(envs.get('results'), selectorsFunctionForGlobalResults));

          // Write data to local env. For child tests.
          if (env) {
            env.set('env.selectors', selectorsLocal);
          }

          // CHECK NEED SELECTORS
          // [['selector', 'sel'], 'another', 'optional?']
          _.forEach(needSelectors, d => {
            const keysSelectors = new Set(Object.keys(selectorsLocal));
            if (_.isString(d) && d.endsWith('?')) return; // optional parametr
            const keysSelectorsIncome = new Set(_.isString(d) ? [d] : d);
            const intersectionSelectors = new Set([...keysSelectors].filter(x => keysSelectorsIncome.has(x)));
            if (!intersectionSelectors.size){
              throw({
                message: `Error: can't find selector "${d}" in ${this.name} test`
              })
            }
          })
        }

        let optionsLocal = {};
        optionsLocal = Object.assign(optionsLocal, options);

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
          options: optionsLocal,
          envsId,
          envs,
          log,
          helper: new Helpers(),
        };

        // IF
        let expr = _.get(inputArgs, 'if');
        if (expr){
            let exprResult = safeEval(expr, dataLocal);
            if (!exprResult) {
              return;
            }
        }

        // ERROR
        let errorExpr = _.get(inputArgs, 'errorIf');
        if (errorExpr){
            let exprResult = false;

            try {
              exprResult = safeEval(errorExpr, dataLocal);
            }
            catch (err) {
              if (err.name == 'ReferenceError'){
                await log({
                  level: 'error',
                  screenshot: true,
                  fullpage: true,
                  text: `errorIf can't evaluate = ${err.message}`
                })
              }
              else {
                throw(err)
              }
            }

            if (exprResult) {
              await log({
                level: 'error',
                screenshot: true,
                fullpage: true,
                text: `Test stoped with error = ${errorExpr}`
              })
              throw({
                message: `Test stoped with error = ${errorExpr}`
              })
            }
        }

        // BIND RESULTS
        let bindResultsLocal = {};
        bindResultsLocal = deepmerge.all([
          this.bindResults,
          this.bindResult,
          this.bR,
          this.br,
          this.results,
          this.result,
          this.r,
          bindResults,
          bindResult,
          bR,
          br,
          results,
          result,
          r,
        ], { arrayMerge: overwriteMerge });

        let resultFromTest = {};

        // RUN FUNCTIONS
        if (_.isFunction(this.beforeTest)){
          this.beforeTest = [this.beforeTest];
        }
        if (_.isArray(this.beforeTest)){
          for (const fun of this.beforeTest){
            let funResult = await fun(args) || {};
            resultFromTest = deepmerge.all([resultFromTest, funResult], { arrayMerge: overwriteMerge });
          }
        }

        if (_.isFunction(this.runTest)){
          this.runTest = [this.runTest];
        }
        if (_.isArray(this.runTest)){
          for (const fun of this.runTest){
            let funResult = await fun(args) || {};
            resultFromTest = deepmerge.all([resultFromTest, funResult], { arrayMerge: overwriteMerge });
          }
        }

        if (_.isFunction(this.afterTest)){
          this.afterTest = [this.afterTest];
        }
        if (_.isArray(this.afterTest)){
          for (const fun of this.afterTest){
            let funResult = await fun(args) || {};
            resultFromTest = deepmerge.all([resultFromTest, funResult], { arrayMerge: overwriteMerge });
          }
        }

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
        })

        // envs.set('results', deepmerge.all([envs.get('results'), resultFromTest], { arrayMerge: overwriteMerge }));

        // Результаты которые просто просто хочется забиндить в переменную, а не приходящие из теста
        Object.keys(bindResultsLocal).forEach(key => {
          let bindKey = _.get(bindResultsLocal, key);
          const availableData = deepmerge.all([
            envs.get('results'),
            dataLocal,
            selectorsLocal,
            resultFromTest,
          ], { arrayMerge: overwriteMerge })
          envs.set(`results.${bindKey}`, _.get(availableData, key));
        });

      }
      catch (err){
        err.envsId = envsId;
        log({level: 'error', text: `Test ${this.name} = ${err.message}`, screenshot: false});
        await errorTest();
        console.log(err)
        throw(err);
      }
    }

    // this.canReuse; // Есть ли зависимости от окружения, типа переключений.
  }
}

module.exports = Test;