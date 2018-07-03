const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const moment = require('moment')

const envs = require('../env')

async function saveScreenshot({ selCSS = false, fullpage = false } = {}) {

  try {
    // Active ENV log settings
    let activeEnv = envs.getEnv();
    let activeLog = _.get(activeEnv, 'env.log', {});
    let current = envs.get('current');
    let pageName = envs.get('current.page');
  
    const now = moment().format('YYYY-MM-DD_HH-mm-ss.SSS');
    //TODO: 2018-06-29 S.Starodubov привести к нормальному формату
    const name = `${now}.jpg`;
  
    if (!envs.get('output.folder')) return;

    const pathScreenshot = path.join(envs.get('output.folder'), name);
    const page = _.get(activeEnv, `state.pages.${pageName}`)
  
    //TODO: 2018-06-29 S.Starodubov нужна проверка на браузер
    if (_.isObject(page)) {
      if (selCSS) {
        const element = await page.$(selCSS);
        await element.screenshot({ path: pathScreenshot });
      }
      if (fullpage) {
        await page.screenshot({ path: pathScreenshot, fullPage: fullpage });
      }
      return name;
    } else {
      return false;
    };
  }
  catch (err){
    console.log(err);
    debugger;
  }
};

function getLevel(level){

  const levels = {
    0: 'raw',
    1: 'debug',
    2: 'info',
    3: 'error',
    4: 'env',
    'raw': 0,
    'debug': 1,
    'info': 2,
    'error': 3,
    'env': 4
  }

  let defaultLevel = 1;

  // Active ENV log settings
  let activeEnv = envs.getEnv();
  let activeLog = _.get(activeEnv, 'env.log', {});
  
  let envLevel =_.get(activeLog, 'level', defaultLevel);
  envLevel = _.isNumber(envLevel) ? envLevel : _.get(levels, envLevel, defaultLevel)
  let inputLevel = level;
  inputLevel = _.isNumber(inputLevel) ? inputLevel : _.get(levels, inputLevel, defaultLevel)

  let envLevelText = levels[envLevel];
  let inputLevelText = levels[inputLevel];

  // If input level higher or equal then global env level thqn logging
  if (envLevel > inputLevel) {
    return false;
  }
  else {
    return inputLevelText;
  }
}

async function _log({ 
  text = '', 
  pageNum = 0, 
  stdOut = true, 
  selCSS = [], 
  screenshot = false, 
  fullpage = false, 
  level = 'info' 
} = {}) {
  try {

    let activeEnv = envs.getEnv();
    let activeLog = _.get(activeEnv, 'env.log', {});

    const screenshots = [];
    const now = moment().format('YYYY-MM-DD_HH-mm-ss.SSS');
  
    screenshot = _.get(activeLog, 'screenshot', screenshot);
    fullpage = _.get(activeLog, 'fullpage', fullpage);

    // LEVEL RULES
    level = getLevel(level);
    if (!level) return;

    // LOG STRINGS
    //TODO: 2018-06-29 S.Starodubov привести в нормальный формат
    const logStringNoTime = `${level} - ${pageNum} - ${text}`;
    const logString = `${now} - ${logStringNoTime}`;
    
    // STDOUT
    if (stdOut) console.log(logString);
    if (level == 'env') {
      console.log(envs);
      debugger;
    }

    // SCRENSHOTS
    let outputFolder = envs.get('output.folder')
    if (!outputFolder) return;

    
    if (screenshot) {
      if (_.isArray(selCSS)){
        for (let css in selCSS) {
          const src = await saveScreenshot({ selCSS: selCSS[css] });
          if (src) {
            screenshots.push(src);
          }
        }
      }
      if (fullpage) {
        const src = await saveScreenshot({ fullpage: fullpage });
        if (src) {
          screenshots.push(src);
        }
      }
    }

    envs.push('log', { 
      text: logStringNoTime, 
      time: now, 
      screenshots: screenshots, 
      level: level 
    });
        
    await fs.appendFileSync(path.join(outputFolder, 'output.log'), logString + '\n', function (err) {
      if (err) {
        return console.log(err);
      }
    });

    // Export JSON log every step
    const exportJson = JSON.stringify(envs.get('log'));
    await fs.writeFileSync(path.join(outputFolder, 'output.json'), exportJson);
  }
  catch (err){
    console.log(err)
  }
}

module.exports = {
  log: _log
};