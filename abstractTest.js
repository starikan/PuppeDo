const fs = require('fs')

const _ = require('lodash');
const safeEval = require('safe-eval')
const yaml = require('js-yaml');

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
      // Биндинги даты
      //  Смотрим на локальные данные this.data
      //  Смотрим на данные в env[envName].data
      //  Смотрим на данные в глобальной env.data
      //  Смотрим на данные в глобальной env.results
      bindData = {},

      // Прямой проброс селекторов
      selectors = {},
      // Биндинги селекторов
      // 1. Смотрим на локальные данные this.selectors
      // 2. Смотрим на данные в глобальной env.selectors
      // 3. Смотрим на данные в env[envName].selectors
      bindSelectors = {},

      bindResult = {},

      options = {},

      // Имя env
      // envNames = [], // Для тестов в которых переключается env

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
    this.bindData = bindData;

    this.selectors = selectors;
    this.bindSelectors = bindSelectors;
    this.allowResults = allowResults;
    this.bindResult = bindResult;

    this.beforeTest = beforeTest;
    this.runTest = runTest;
    this.afterTest = afterTest;

    this.repeat = repeat;

    this.run = async (
      {
        data = {},
        d = {}, // alias for data

        selectors = {},
        s = {}, // alias for selectors
        selector = {}, // alias for selectors

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
        ...inputArgs
      // envName,
      // repeat,
      } = {},

      envsId
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

        let dataLocal = {};

        let ppd_data_ext_files = process.env.PPD_DATA_EXT ? JSON.parse(process.env.PPD_DATA_EXT) : [];
        ppd_data_ext_files.forEach(f => {
          const ppd_data_ext = yaml.safeLoad(fs.readFileSync(f, 'utf8'));
          dataLocal = Object.assign(dataLocal, ppd_data_ext);
        })
        dataLocal = Object.assign(dataLocal, process.env.PPD_DATA ? JSON.parse(process.env.PPD_DATA) : {});
        dataLocal = Object.assign(dataLocal, envs.get('results'));
        dataLocal = Object.assign(dataLocal, envs.get('data'));
        dataLocal = Object.assign(dataLocal, env ? env.get('data') : {});
        dataLocal = Object.assign(dataLocal, this.data);
        dataLocal = Object.assign(dataLocal, data);
        dataLocal = Object.assign(dataLocal, d);

        let bindDataLocal = {};
        bindDataLocal = Object.assign(bindDataLocal, this.bindData);
        bindDataLocal = Object.assign(bindDataLocal, bindData);
        bindDataLocal = Object.assign(bindDataLocal, bD);
        bindDataLocal = Object.assign(bindDataLocal, bd);

        for (const key in bindDataLocal){
          if (!_.get(dataLocal, key)){
            dataLocal[key] = _.get(dataLocal, bindDataLocal[key]);
          }
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

        let selectorsLocal = {};

        if (page){
          let ppd_selectors_ext_files = process.env.PPD_SELECTORS_EXT ? JSON.parse(process.env.PPD_SELECTORS_EXT) : [];
          ppd_selectors_ext_files.forEach(f => {
            const ppd_selectors_ext = yaml.safeLoad(fs.readFileSync(f, 'utf8'));
            selectorsLocal = Object.assign(selectorsLocal, ppd_selectors_ext);
          })
          selectorsLocal = Object.assign(selectorsLocal, process.env.PPD_SELECTORS ? JSON.parse(process.env.PPD_SELECTORS) : {});
          selectorsLocal = Object.assign(selectorsLocal, envs.get('results'));
          selectorsLocal = Object.assign(selectorsLocal, envs.get('selectors'));
          selectorsLocal = Object.assign(selectorsLocal, env ? env.get('selectors') : {});
          selectorsLocal = Object.assign(selectorsLocal, this.selectors);
          selectorsLocal = Object.assign(selectorsLocal, selectors);
          selectorsLocal = Object.assign(selectorsLocal, selector);
          selectorsLocal = Object.assign(selectorsLocal, s);

          // BINDING SELECTORS
          let bindSelectorsLocal = {};
          bindSelectorsLocal = Object.assign(bindSelectorsLocal, this.bindSelectors);
          bindSelectorsLocal = Object.assign(bindSelectorsLocal, bindSelectors);
          bindSelectorsLocal = Object.assign(bindSelectorsLocal, bindSelector);
          bindSelectorsLocal = Object.assign(bindSelectorsLocal, bS);
          bindSelectorsLocal = Object.assign(bindSelectorsLocal, bs);

          for (const key in bindSelectorsLocal){
            if (!_.get(selectorsLocal, key)){
              selectorsLocal[key] = _.get(selectorsLocal, bindSelectorsLocal[key]);
            }
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
          results: this.allowResults,
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

        // debugger;

        // BIND RESULTS
        let bindResultsLocal = {};
        bindResultsLocal = Object.assign(bindResultsLocal, this.bindResults);
        bindResultsLocal = Object.assign(bindResultsLocal, bindResults);
        bindResultsLocal = Object.assign(bindResultsLocal, bindResult);
        bindResultsLocal = Object.assign(bindResultsLocal, bR);
        bindResultsLocal = Object.assign(bindResultsLocal, br);

        let result = {};

        // RUN FUNCTIONS
        if (_.isFunction(this.beforeTest)){
          this.beforeTest = [this.beforeTest];
        }
        if (_.isArray(this.beforeTest)){
          for (const fun of this.beforeTest){
            let funResult = await fun(args) || {};
            result = Object.assign(result, funResult);
          }
        }

        if (_.isFunction(this.runTest)){
          this.runTest = [this.runTest];
        }
        if (_.isArray(this.runTest)){
          for (const fun of this.runTest){
            let funResult = await fun(args) || {};
            result = Object.assign(result, funResult);
          }
        }

        if (_.isFunction(this.afterTest)){
          this.afterTest = [this.afterTest];
        }
        if (_.isArray(this.afterTest)){
          for (const fun of this.afterTest){
            let funResult = await fun(args) || {};
            result = Object.assign(result, funResult);
          }
        }

        // todo
        // выкидывать предупреждение если пришло в результатах то чего нет в allowResults
        // или если не пришло то чего нужно

        // RESULTS
        Object.keys(result).forEach(key => {
          let bindKey = _.get(bindResultsLocal, key);
          if (bindKey && this.allowResults.includes(key)) {
            envs.set(`results.${bindKey}`, result[key]);
          }
        })
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