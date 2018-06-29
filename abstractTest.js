const envGlobal = require('./env')
const _ = require('lodash');

// const { log } = require('./logger/logger');

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
      // [{}] - много данных для посторения repeat
      data = {},
      // Биндинги даты
      // 1. Смотрим на локальные данные this.data
      // 3. Смотрим на данные в env[envName].data
      // 2. Смотрим на данные в глобальной env.data
      // 2. Смотрим на данные в глобальной env.outputs
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
      envName = null, // Если нет то берем активную

      // Колличество повторений
      repeat = 1,

      beforeTest = async function(){},
      runTest = async function(){},
      afterTest = async function(){},
      // logLevel = 'debug',
    //   ...envExt
    // } = {},
    // {
    //   ...resultsExt
    // } = {},
    } = {}
  ){
    // this.args = {
    //   data: {}
    // }
    this.runTest = runTest;
    console.log("NEW")

    // this.canReuse; // Есть ли зависимости от окружения, типа переключений.
    // this.typeTest; // atom, test
    // Получаем активную env
    // let envGlobal = 


    // this.env = {
    //   logLevel: _.get(envExt, 'logLevel', )
    // }
  }

  setThis({name, value} = {}){
    if (name && _.isString(name)){
      _.set(this, name, value);
    }
  }

  setAvailableEnvs(envs){

  }

  setAvailableBrowsers(browsers){

  }

  setSelectors(selectors = {}, bindings = {}){

  }

  async run ({
    // data,
    // bindData,
    // selectors,
    // bindSelectors,
    // envName,
    // repeat,
  } = {}){
    // let foo = 'bar';
    // this = Object.assign(this, args);
    console.log('RUN')
    // await this.runTest()
  }
}


// async function abstractTest(
//   {
//     // Если null то не какие данные не биндим
//     // Если строка то выжираем м env
//     // Если объект то используется только он для данных
//     data = null,
//     // Если null то не какие данные не биндим
//     // Если строка то выжираем м env
//     // Если объект то используется только он
//     selectors = null, 
//   } = {},
//   { 
//     envName,
//     repeat = 1,
//     pageNum = 0, 
//     waitTime = 0, 
//     isScreenshot = false,
//     isFullScreenshot = false 
//   } = {}
// ) {

//   if (envName) {
//     e = env.get('envName')
//   }

//   // require browser type
//   // require exists browser and page
//   // require env

//   page = env.get(`pages.${pageNum}`);

//   if (page) {
//     if (selCSS) {
//       await page.type(selCSS, text);
//     }
//     await page.waitFor(waitTime);

//     await log({ 
//       text: `Ввод текста в INPUT = ${selCSS}, TEXT = ${text}`, 
//       selCSS: [selCSS],  
//       isScreenshot: isScreenshot, 
//       isFullScreenshot: isFullScreenshot,
//       level: 'debug'
//      });
//   };
// };

module.exports = Test;