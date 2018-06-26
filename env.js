const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const moment = require('moment')
const puppeteer = require('puppeteer');

let args = {}
_.forEach(process.argv.slice(2), v => {
  let data = v.split("=");
  args[data[0]] = data[1];
});

async function runPuppeteer(browserSettings){
  const browser = await puppeteer.launch({
    headless: _.get(browserSettings, "headless", true),
    slowMo: _.get(browserSettings, "slowMo", 0),
    args: _.get(browserSettings, "args", [])
  });

  
  const page = await browser.newPage();
  const override = Object.assign(page.viewport(), _.get(browserSettings, 'windowSize'));
  await page.setViewport(override);
  
  let pages = {"main": page};
  
  return { browser, pages };
}
class Env {

  constructor(name, env = {}){
    this.name = name;
    this.state = {
      // тут браузер, страницы, куки
    }
    this.env = {
      name: name,
      data: {},
      selectors: {},
      logLevel: "debug",
      screenshots: {
        isScreenshot: false,
        fullPage: false
      }      
    };
    this.env = Object.assign(this.env, env);

  }

  set (name, data) {
    return _.set(this.env, name, data);
  }

  setState () {
    // Подмена браузера, установка куков
  }
  
  get (name, def = null) {
    return _.get(this.env, name, def);
  }
  
  getCurr () {
    return this.state;
  }
  
  push (name, data) {
    let arr = _.clone(this.get(name, []));
    arr.push(data);
    return _.set(this.env, name, arr);
  }
}

class Envs {
  constructor ({ output = 'output', name = 'test', files = []} = {}){
    this.envs = {};
    this.data = {};
    this.selectors = {};
    this.current = {};
    this.results = {};
    this.output = {};
  }

  setEnv (name, page = null){
    if (name && Object.keys(this.envs).includes(name)) {
      this.current.name = name;
      this.current.page = page;
    }
  }

  getEnv (name){
    return _.get(this.envs, name);
  }

  async createEnv ({env = {}, file = null, name = null} = {}){
    if (file) {
      env = await require(file);
      name = env.name;
    }
    
    if (name && env) {
      this.envs[name] = new Env(name, env);
    }
  }

  async initTest({ output = 'output', test = 'test' } = {}) {
    if (!fs.existsSync(output)) {
      await fs.mkdirSync(output);
    };
    
    const now = moment().format('YYYY-MM-DD_HH-mm-ss.SSS');
    
    const folder = path.join(output, `/${test}_${now}`);
    await fs.mkdirSync(folder);
    
    fs.createReadStream('./logger/output.html').pipe(fs.createWriteStream(path.join(folder, 'output.html')));

    this.output.output = output;
    this.output.name = test;
    this.output.folder = folder;
  }  

  async runBrowsers(){
    for (let i = 0; i < Object.keys(this.envs).length; i++) {
      const key = Object.keys(this.envs)[i];
      const env = this.envs[key];
      
      const type = _.get(env, 'env.browser.type');
      const runtime = _.get(env, 'env.browser.runtime');
      const browserSettings = _.get(env, 'env.browser');

      
      console.log(env)

      if (type === 'api'){}
      if (type === 'puppeteer'){
        if (runtime === 'run'){
          console.log("run")
          const {browser, pages} = await runPuppeteer(browserSettings)
          env.state = Object.assign(env.state, {browser, pages})
        }
      }
    }
  }

  async closeBrowsers(){
    for (let i = 0; i < Object.keys(this.envs).length; i++) {
      const key = Object.keys(this.envs)[i];
      const state = this.envs[key].state;

      const type = _.get(this.envs[key], 'env.browser.type');
      const runtime = _.get(this.envs[key], 'env.browser.runtime');
      const browserSettings = _.get(this.envs[key], 'env.browser');

      //TODO: 2018-06-26 S.Starodubov Сделать закрытие на основе переменных открытия
      try {
        state.browser.close()
      }
      catch (exc) {}
    }
  }
}

let test = _.get(args, '--test', 'test');
let output = _.get(args, '--output', 'output');
let files = JSON.parse(_.get(args, '--envs', []));

module.exports = async function () {
  let env = new Envs();
  await env.initTest({test, output})
  for (let i = 0; i < files.length; i++) {
    await env.createEnv({file: files[i]});
  }
  await env.runBrowsers();
  return env;
};