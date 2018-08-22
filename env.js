const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const yaml = require('js-yaml');
const _ = require('lodash');
const moment = require('moment')
const puppeteer = require('puppeteer');
const uuid = require('uuid/v1');
const axios = require('axios');
const sleep = require('sleep');

const logger = require('./logger/logger');

let args_ext = {}
_.forEach(process.argv.slice(2), v => {
  let data = v.split("=");
  args_ext[data[0]] = data[1];
});

async function runPuppeteer (browserSettings){
  const browser = await puppeteer.launch({
    headless: _.get(browserSettings, "headless", true),
    slowMo: _.get(browserSettings, "slowMo", 0),
    args: _.get(browserSettings, "args", [])
  });

  const page = await browser.newPage();
  const override = Object.assign(page.viewport(), _.get(browserSettings, 'windowSize'));
  await page.setViewport(override);

  let pages = {"main": page};

  let width = _.get(browserSettings, 'windowSize.width');
  let height = _.get(browserSettings, 'windowSize.height');
  if (width && height) {
    await pages.main.setViewport({
      width: width,
      height: height,
    });
  }

  return { browser, pages };
};

async function connectElectron(browserSettings) {

  const urlDevtoolsJson = _.get(browserSettings, 'urlDevtoolsJson');

  if (urlDevtoolsJson){
    let jsonPages = await axios.get(urlDevtoolsJson + 'json');
    let jsonBrowser = await axios.get(urlDevtoolsJson + 'json/version');

    jsonPages = _.get(jsonPages, 'data');
    jsonBrowser = _.get(jsonBrowser, 'data');

    if (!jsonBrowser || !jsonPages) {
      throw ({
        message: `Can't connect to ${urlDevtoolsJson}`
      })
    }

    const webSocketDebuggerUrl = _.get(jsonBrowser, 'webSocketDebuggerUrl');

    if (!webSocketDebuggerUrl){
      throw ({
        message: `webSocketDebuggerUrl empty. Posibly wrong Electron version running`
      })
    }

    const browser = await puppeteer.connect({
      browserWSEndpoint: webSocketDebuggerUrl,
      ignoreHTTPSErrors: true,
      slowMo: _.get(browserSettings, "slowMo", 0)
    });
    let pagesRaw = await browser.pages();
    let pages = {"main": pagesRaw[pagesRaw.length - 1]};

    let width = _.get(browserSettings, 'windowSize.width');
    let height = _.get(browserSettings, 'windowSize.height');
    if (width && height) {
      await pages.main.setViewport({
        width: width,
        height: height,
      });
    };

    // // Window frame - probably OS and WM dependent.
    // height += 85;

    // // Any tab.
    // const {targetInfos: [{targetId}]} = await browser._connection.send(
    //   'Target.getTargets'
    // );

    // // Tab window.
    // const {windowId} = await browser._connection.send(
    //   'Browser.getWindowForTarget',
    //   {targetId}
    // );

    // // Resize.
    // await browser._connection.send('Browser.setWindowBounds', {
    //   bounds: {height, width},
    //   windowId
    // });

    return { browser: browser, pages: pages };
  }

  throw ({
    message: `Can't connect to Electron ${urlDevtoolsJson}`
  })

};

async function runElectron(browserSettings) {

  const runtimeExecutable = _.get(browserSettings, 'runtimeEnv.runtimeExecutable');
  const program = _.get(browserSettings, 'runtimeEnv.program');
  const cwd = _.get(browserSettings, 'runtimeEnv.cwd');
  const browser_args = _.get(browserSettings, 'runtimeEnv.args', []);
  const browser_env = _.get(browserSettings, 'runtimeEnv.env', {});
  const pauseAfterStartApp = _.get(browserSettings, 'runtimeEnv.pauseAfterStartApp', 5);

  if (runtimeExecutable){
    const run_args = [program, ...browser_args];
    process.env = Object.assign(process.env, browser_env)

    let prc = spawn(runtimeExecutable, run_args, {
      cwd,
      // detached: true
    });

    prc.stdout.on('data', (data) => {
      // console.log(String(data));
    })

    await sleep.sleep(pauseAfterStartApp);

    let { browser, pages } = await connectElectron(browserSettings);
    return { browser: browser, pages: pages };
  }
  else {
    throw ({
      message: `Can't run Electron ${runtimeExecutable}`
    })
  }


};
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

  getState (value = null) {
    if (value){
      return _.get(this, `state.${value}`)
    }
    return this.state;
  }

  push (name, data) {
    let arr = _.clone(this.get(name, []));
    try {
      arr.push(data);
    }
    catch (err) {
      console.log('class Env -> push');
      console.log(err);
    }
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
    this.log = [];
  }

  get(name, def = null){
    return _.get(this, name, def);
  }

  set (name, data) {
    return _.set(this, name, data);
  }

  push (name, data) {
    let arr = _.clone(this.get(name, []));
    try {
      arr.push(data);
    }
    catch (err) {
      console.log('class Envs -> push');
      console.log(err);
    }
    return _.set(this, name, arr);
  }

  setEnv (name, page = null){
    if (name && Object.keys(this.envs).includes(name)) {
      this.current.name = name;
      if (page && _.get(this.envs[name], `state.pages.${page}`)){
        this.current.page = page;
      }
      else if (_.get(this.envs[name], 'state.pages.main')) {
        this.current.page = 'main';
      }
      else {
        this.current.page = null;
      }
    }
  }

  getEnv (name){
    if (!name){
      name = _.get(this, 'current.name')
    }
    return _.get(this.envs, name, {});
  }

  async createEnv ({env = {}, file = null, name = null} = {}){
    if (file && file.endsWith('.yaml')) {
      env = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
      name = env.name;
    }

    if (env) {
      if (_.get(env, 'dataExt')) {
        let dataExtList = _.get(env, 'dataExt');
        if (_.isString(dataExtList)) {
          dataExtList = [dataExtList];
        }
        if (!_.isArray(dataExtList)){
          throw({
            message: `dataExt wrong format ${dataExt}, ${file}`
          })
        }
        for (let i = 0; i < dataExtList.length; i++) {
          const dataExtFile = dataExtList[i];
          let dataExt = yaml.safeLoad(fs.readFileSync(path.join(this.args.testsFolder, dataExtFile), 'utf8'));
          env.data = env.data || {};
          env.data = Object.assign(env.data, dataExt);
        }
      }

      if (_.get(env, 'selectorsExt')) {
        let selectorsExtList = _.get(env, 'selectorsExt');
        if (_.isString(selectorsExtList)) {
          selectorsExtList = [selectorsExtList];
        }
        if (!_.isArray(selectorsExtList)){
          throw({
            message: `selectorsExt wrong format ${selectorsExt}, ${file}`
          })
        }
        for (let i = 0; i < selectorsExtList.length; i++) {
          const selectorsExtFile = selectorsExtList[i];
          let selectorsExt = yaml.safeLoad(fs.readFileSync(path.join(this.args.testsFolder, selectorsExtFile), 'utf8'));
          env.selectors = env.selectors || {};
          env.selectors = Object.assign(env.selectors, selectorsExt);
        }
      }
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

    fs.createReadStream(path.join(path.resolve(__dirname), 'logger/output.html')).pipe(fs.createWriteStream(path.join(folder, 'output.html')));

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

      if (type === 'api'){}

      if (type === 'puppeteer'){
        if (runtime === 'run'){
          const {browser, pages} = await runPuppeteer(browserSettings);
          env.state = Object.assign(env.state, {browser, pages});
        }
      }

      if (type === 'electron'){
        if (runtime === 'connect'){
          const {browser, pages} = await connectElectron(browserSettings);
          env.state = Object.assign(env.state, {browser, pages});
        }
        if (runtime === 'run'){
          const {browser, pages} = await runElectron(browserSettings);
          env.state = Object.assign(env.state, {browser, pages});
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

  async init(args = {}){

    let testFile = process.env.PPD_TEST || _.get(args, 'test') || _.get(args_ext, '--test');
    let outputFolder = process.env.PPD_OUTPUT || _.get(args, 'output') ||  _.get(args_ext, '--output', 'output');
    let envFiles = JSON.parse(process.env.PPD_ENVS) || _.get(args, 'envs') || JSON.parse(_.get(args_ext, '--envs'));
    let testsFolder = process.env.PPD_TEST_FOLDER || _.get(args, 'testsFolder') || _.get(args_ext, '--testsFolder', '.');

    let testName = testFile.split('/')[testFile.split('/').length - 1];

    if (!testFile) {
      throw({
        message: `Не указано имя головного теста. Параметр 'test'`
      })
    }

    if (!envFiles) {
      throw({
        message: `Не указано ни одной среды исполнения. Параметр 'envs' должен быть не пустой массив`
      })
    }

    this.set('args', {testFile, outputFolder, envFiles, testName, testsFolder})

    await this.initTest({test: testName, output: outputFolder})

    for (let i = 0; i < envFiles.length; i++) {
      await this.createEnv({file: envFiles[i]});
    }

    await this.runBrowsers();

    // If already init do nothing
    this.init = async function() {};
  }

}

let instances = {};

module.exports = function(envsId){

  if (envsId && _.get(instances, envsId)){
    return {
      envsId,
      envs: _.get(instances, envsId).envs,
      log: _.get(instances, envsId).log
    }
  }

  if (envsId && !_.get(instances, envsId)){
    throw({
      message: `Unknown ENV ID ${envsId}`
    })
  }

  if (!envsId){
    envsId = uuid();
    let newEnvs = new Envs();

    instances[envsId] = {
      envs: newEnvs,
      log: logger(newEnvs)
    }

    return {
      envsId,
      envs: instances[envsId].envs,
      log: instances[envsId].log
    }
  }

  throw({
    message: 'Error ENVS export'
  })
};
