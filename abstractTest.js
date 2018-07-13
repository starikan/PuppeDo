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
          selectors: selectorsLocal
        };

        // IF
        let expr = _.get(inputArgs, 'if');
        if (expr){
            let exprResult = safeEval(expr, dataLocal);
            if (!exprResult) {
              return;
            }
        }

        // RUN FUNCTIONS
        if (_.isFunction(this.beforeTest)){
          await this.beforeTest(args);
        }
        else if (_.isArray(this.beforeTest)){
          for (const fun of this.beforeTest){
            await fun(args)
          }
        }
        
        if (_.isFunction(this.runTest)){
          await this.runTest(args);
        }
        else if (_.isArray(this.runTest)){
          for (const fun of this.runTest){
            await fun(args)
          }
        }

        if (_.isFunction(this.afterTest)){
          await this.afterTest(args);
        }
        else if (_.isArray(this.afterTest)){
          for (const fun of this.afterTest){
            await fun(args)
          }
        }  
      }
      catch (err){
        log({level: 'error', text: `Test ${name} = ${err.message}`, screenshot: false});
        await errorTest();
        throw(err);
      }
    }

    // this.canReuse; // Есть ли зависимости от окружения, типа переключений.
  }
}

module.exports = Test;