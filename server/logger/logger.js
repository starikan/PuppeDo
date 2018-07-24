const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const moment = require('moment')

class Logger {
  constructor(envs){
    this.envs = envs;
  }

  async saveScreenshot({ selCSS = false, fullpage = false } = {}) {

    try {
      // Active ENV log settings
      let activeEnv = this.envs.getEnv();
      let activeLog = _.get(activeEnv, 'env.log', {});
      let current = this.envs.get('current');
      let pageName = this.envs.get('current.page');
    
      const now = moment().format('YYYY-MM-DD_HH-mm-ss.SSS');
      //TODO: 2018-06-29 S.Starodubov привести к нормальному формату
      const name = `${now}.jpg`;
    
      if (!this.envs.get('output.folder')) return;
  
      const pathScreenshot = path.join(this.envs.get('output.folder'), name);
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
  
  getLevel(level){
  
    const levels = {
      0: 'raw',
      1: 'debug',
      2: 'info',
      3: 'test',
      4: 'warn',
      5: 'error',
      6: 'env',
      'raw': 0,
      'debug': 1,
      'info': 2,
      'test': 3,
      'warn': 4,
      'error': 5,
      'env': 6
    }
  
    let defaultLevel = 1;
  
    // Active ENV log settings
    let activeEnv = this.envs.getEnv();
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
  
  async _log({ 
    text = '', 
    pageNum = 0, 
    stdOut = true, 
    selCSS = [], 
    screenshot = null, 
    fullpage = null, 
    level = 'info',
    debug = false,
  } = {}) {
    try {
  
      let activeEnv = this.envs.getEnv();
      let activeLog = _.get(activeEnv, 'env.log', {});
  
      const screenshots = [];
      const now = moment().format('YYYY-MM-DD_HH-mm-ss.SSS');
    
      if (!_.isBoolean(screenshot)){
        screenshot = _.get(activeLog, 'screenshot', false);
      }
      if (!_.isBoolean(fullpage)){
        fullpage = _.get(activeLog, 'fullpage', false);
      }
  
      // LEVEL RULES
      level = this.getLevel(level);
      if (!level) return;
  
      // LOG STRINGS
      //TODO: 2018-06-29 S.Starodubov привести в нормальный формат
      const logStringNoTime = `${level} - ${pageNum} - ${text}`;
      const logString = `${now} - ${logStringNoTime}`;
      
      // STDOUT
      if (stdOut) console.log(logString);
      if (level == 'env') {
        console.log(this.envs);
        debugger;
      }
  
      // SCRENSHOTS
      let outputFolder = this.envs.get('output.folder')
      if (!outputFolder) return;
  
      
      if (screenshot) {
  
        if (_.isString(selCSS)){
          selCSS = [selCSS]
        }
        
        if (_.isArray(selCSS)){
          for (let css in selCSS) {
            const src = await this.saveScreenshot({ selCSS: selCSS[css] });
            if (src) {
              screenshots.push(src);
            }
          }
        }
  
        if (fullpage) {
          const src = await this.saveScreenshot({ fullpage: fullpage });
          if (src) {
            screenshots.push(src);
          }
        }
      }
  
      this.envs.push('log', { 
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
      const exportJson = JSON.stringify(this.envs.get('log'));
      await fs.writeFileSync(path.join(outputFolder, 'output.json'), exportJson);
  
      if (debug){
        debugger;
      }
    }
    catch (err){
      console.log(err)
    }
  }
}

module.exports = function(envs){
  if (!envs){
    throw({
      message: "Logger need ENVS"
    })
  }

  const logger = new Logger(envs);
  return logger._log.bind(logger);
};