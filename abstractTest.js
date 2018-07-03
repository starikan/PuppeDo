const envs = require('./env')
const _ = require('lodash');

const { log } = require('./logger/logger');

class Test {
  constructor(
    {
      
      // Имя теста
      // На базе имени ищутся данные в data в частности data[name] 
      name, 

      // Тип теста atom, test, multiEnv
      // Если atom то обязательный прямой проброс данных
      type,

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
      // envName,
      // repeat,
      } = {}
    ) => {

      try {

        // CURRENT ENV
        const envName = envs.get('current.name');

        if (_.isArray(this.needEnv)){
          if (this.needEnv.length && !this.needEnv.includes(envName)){
            throw({message: `Wrong Environment, local env = ${envName}`});
          }
        }
        else {
          throw({message: "needEnv wrong format, need array"});
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

          for (const sel in needSelectors){
            if (!Object.keys(selectorsLocal).includes())
          }

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
  
        await this.beforeTest(args);
  
        await this.runTest(args);
  
        await this.afterTest(args);
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