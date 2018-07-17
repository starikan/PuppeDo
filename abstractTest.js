const _ = require('lodash');
const safeEval = require('safe-eval')

const envs = require('./env')
const { log } = require('./logger/logger');

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

      // Имя env 
      envNames = [], // Для тестов в которых переключается env
      // envName = null, // Если нет то берем активную

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

    // this.envNames = envNames;
    // this.envName = envName;

    this.beforeTest = beforeTest;
    this.runTest = runTest;
    this.afterTest = afterTest;

    this.repeat = repeat;

    this.run = async (
      {
        data = {},
        selectors = {},
        bindData = {},
        bindSelectors = {},
        bindResults = {},
        ...inputArgs
      // envName,
      // repeat,
      } = {}
    ) => {

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
        const browser = env.getState('browser');
        const page =  env.getState(`pages.${envPageName}`);
        //TODO: 2018-07-03 S.Starodubov если нет page то может это API
  
        let dataLocal = {};
        dataLocal = Object.assign(dataLocal, envs.get('results'));
        dataLocal = Object.assign(dataLocal, envs.get('data'));
        dataLocal = Object.assign(dataLocal, env.get('data'));
        dataLocal = Object.assign(dataLocal, this.data);
        dataLocal = Object.assign(dataLocal, data);
        
        let bindDataLocal = {};
        bindDataLocal = Object.assign(bindDataLocal, this.bindData);
        bindDataLocal = Object.assign(bindDataLocal, bindData);
  
        for (const key in bindDataLocal){
          if (!_.get(dataLocal, key)){
            dataLocal[key] = _.get(dataLocal, bindDataLocal[key]);
          }
        }

        // CHECK NEED DATA
        _.forEach(needData, d => {
          if (!_.get(dataLocal, d)){
            throw({
              message: `Error: can't find data parametr "${d}" in ${this.name} test`
            })
          }
        })

        let selectorsLocal = {};

        if (page){
          selectorsLocal = Object.assign(selectorsLocal, envs.get('results'));
          selectorsLocal = Object.assign(selectorsLocal, envs.get('selectors'));
          selectorsLocal = Object.assign(selectorsLocal, env.get('selectors'));
          selectorsLocal = Object.assign(selectorsLocal, this.selectors);
          selectorsLocal = Object.assign(selectorsLocal, selectors);
    
          // BINDING SELECTORS
          let bindSelectorsLocal = {};
          bindSelectorsLocal = Object.assign(bindSelectorsLocal, this.bindSelectors);
          bindSelectorsLocal = Object.assign(bindSelectorsLocal, bindSelectors);
          
          for (const key in bindSelectorsLocal){
            if (!_.get(selectorsLocal, key)){
              selectorsLocal[key] = _.get(selectorsLocal, bindSelectorsLocal[key]);
            }
          }

          // CHECK NEED SELECTORS
          _.forEach(needSelectors, d => {
            if (!_.get(selectorsLocal, d)){
              throw({
                message: `Error: can't find selector "${d}" in ${this.name} test`
              })
            }
          })
        }
        
        // debugger;

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
          results: this.allowResults
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
        log({level: 'error', text: `Test ${this.name} = ${err.message}`, screenshot: false});
        await errorTest();
        throw(err);
      }
    }

    // this.canReuse; // Есть ли зависимости от окружения, типа переключений.
  }
}

module.exports = Test;