const envGlobal = require('./env')
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
      avaiableEnvTypes = [],
      availableData = [],
      availableSelectors = [],

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

    this.data = data;
    this.bindData = bindData;

    this.selectors = selectors; 
    this.bindSelectors = bindSelectors;

    this.envNames = envNames;
    // this.envName = envName;

    this.beforeTest = beforeTest;
    this.runTest = runTest;
    this.afterTest = afterTest;

    this.repeat = repeat;

    this.run = async (
      data = {},
      selectors = {},
      {
        bindData = {},
        bindSelectors = {},
      // envName,
      // repeat,
      } = {}
    ) => {

      try {
        const envName = envGlobal.get('current.name');
        //TODO: 2018-07-03 S.Starodubov проверка на envsNames, енсли пусто то пох
        const envPageName = envGlobal.get('current.page');
  
        const env = envGlobal.get(`envs.${envName}`);
        const browser = env.getState('browser');
        const page =  env.getState(`pages.${envPageName}`);
  
        let dataLocal = {};
        dataLocal = Object.assign(dataLocal, envGlobal.get('results'));
        dataLocal = Object.assign(dataLocal, envGlobal.get('data'));
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
  
        console.log(dataLocal.url)
        let selectorsLocal = {};
        selectorsLocal = Object.assign(selectorsLocal, envGlobal.get('results'));
        selectorsLocal = Object.assign(selectorsLocal, envGlobal.get('selectors'));
        selectorsLocal = Object.assign(selectorsLocal, env.get('selectors'));
        selectorsLocal = Object.assign(selectorsLocal, this.selectors);
        selectorsLocal = Object.assign(selectorsLocal, selectors);
  
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
  
        debugger;
  
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