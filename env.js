const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const crypto = require('crypto');

const _ = require('lodash');
const dayjs = require('dayjs');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const walkSync = require('walk-sync');
const yaml = require('js-yaml');

const logger = require('./logger');
const { merge, sleep, Arguments, TestsContent } = require('./helpers');

class Env {
  constructor(name, env = {}) {
    this.name = name;
    this.state = {
      // тут браузер, страницы, куки
    };
    this.env = {
      name: name,
      data: {},
      selectors: {},
      logLevel: 'debug',
      screenshots: { isScreenshot: false, fullPage: false },
    };
    this.env = Object.assign(this.env, env);
  }

  set(name, data) {
    return _.set(this, name, data);
  }

  setState() {
    //TODO: Подмена браузера, установка куков
  }

  get(name, def = null) {
    return _.get(this.env, name, def);
  }

  getState(value = null) {
    if (value) {
      return _.get(this, `state.${value}`);
    }
    return this.state;
  }

  push(name, data) {
    let arr = _.clone(this.get(name, []));
    try {
      arr.push(data);
    } catch (err) {
      console.log('class Env -> push');
      console.log(err);
    }
    return _.set(this.env, name, arr);
  }
}

class Envs {
  constructor() {
    this.envs = {};
    this.data = {};
    this.selectors = {};
    this.current = {};
    this.results = {};
    this.output = {};
    this.log = [];
  }

  get(name, def = null) {
    return _.get(this, name, def);
  }

  set(name, data) {
    return _.set(this, name, data);
  }

  push(name, data) {
    let arr = _.clone(this.get(name, []));
    try {
      arr.push(data);
    } catch (err) {
      console.log('class Envs -> push');
      console.log(err);
    }
    return _.set(this, name, arr);
  }

  setEnv(name, page = null) {
    if (name && Object.keys(this.envs).includes(name)) {
      this.current.name = name;
      if (page && _.get(this.envs[name], `state.pages.${page}`)) {
        this.current.page = page;
      } else if (_.get(this.envs[name], 'state.pages.main')) {
        this.current.page = 'main';
      } else {
        this.current.page = null;
      }
    }
  }

  getEnv(name) {
    if (!name) {
      name = _.get(this, 'current.name');
    }
    return _.get(this.envs, name, {});
  }

  async initOutput(args) {
    const test = args.testName || 'test';
    const output = args.PPD_OUTPUT || 'output';
    if (!fs.existsSync(output)) {
      await fs.mkdirSync(output);
    }
    const now = dayjs().format('YYYY-MM-DD_HH-mm-ss.SSS');

    const folder = path.join(output, `/${test}_${now}`);
    await fs.mkdirSync(folder);

    await fs.copyFileSync(path.join(path.resolve(__dirname), 'output.html'), path.join(folder, 'output.html'));

    this.output.output = output;
    this.output.name = test;
    this.output.folder = folder;
  }

  async initOutputLatest(args) {
    const output = args.PPD_OUTPUT || 'output';
    let folderLatest = path.join(output, 'latest');

    if (!fs.existsSync(output)) {
      await fs.mkdirSync(output);
    }

    // Create latest log path
    if (!fs.existsSync(folderLatest)) {
      fs.mkdirSync(folderLatest);
    } else {
      let filesExists = walkSync(folderLatest);
      for (let i = 0; i < filesExists.length; i++) {
        fs.unlinkSync(path.join(folderLatest, filesExists[i]));
      }
    }

    await fs.copyFileSync(path.join(path.resolve(__dirname), 'output.html'), path.join(folderLatest, 'output.html'));

    this.output.folderLatest = folderLatest;

    // Drop this function after first use
    this.initOutputLatest = () => {};
  }

  async runBrowsers(args) {
    for (let i = 0; i < Object.keys(this.envs).length; i++) {
      const key = Object.keys(this.envs)[i];
      const env = this.envs[key];

      const type = _.get(env, 'env.browser.type', 'puppeteer');
      const runtime = _.get(env, 'env.browser.runtime', 'run');
      const browserSettings = _.get(env, 'env.browser', {});

      if (type === 'api') {
        // TODO: 2019-07-18 S.Starodubov todo
      }

      if (type === 'puppeteer') {
        if (runtime === 'run') {
          const { browser, pages } = await this.runPuppeteer(browserSettings, args);
          env.state = Object.assign(env.state, { browser, pages });
        }
      }

      if (type === 'electron') {
        if (runtime === 'connect') {
          const { browser, pages } = await this.connectElectron(browserSettings);
          env.state = Object.assign(env.state, { browser, pages });
        }
        if (runtime === 'run') {
          const { browser, pages, pid } = await this.runElectron(browserSettings, env);
          env.state = Object.assign(env.state, { browser, pages, pid });
        }
      }
    }
  }

  async runPuppeteer(browserSettings, args = {}) {
    const browser = await puppeteer.launch({
      headless: _.get(browserSettings, 'headless', true),
      slowMo: _.get(browserSettings, 'slowMo', 0),
      args: _.get(browserSettings, 'args', []),
      devtools: !!_.get(args, 'PPD_DEBUG_MODE', false),
    });

    const page = await browser.newPage();
    const override = Object.assign(page.viewport(), _.get(browserSettings, 'windowSize'));
    await page.setViewport(override);

    let pages = { main: page };

    let width = _.get(browserSettings, 'windowSize.width');
    let height = _.get(browserSettings, 'windowSize.height');
    if (width && height) {
      await pages.main.setViewport({ width: width, height: height });
    }

    return { browser, pages };
  }

  async connectElectron(browserSettings) {
    const urlDevtoolsJson = _.get(browserSettings, 'urlDevtoolsJson');

    if (urlDevtoolsJson) {
      const jsonPagesResponse = await fetch(urlDevtoolsJson + 'json', { method: 'GET' });
      const jsonBrowserResponse = await fetch(urlDevtoolsJson + 'json/version', { method: 'GET' });

      const jsonPages = await jsonPagesResponse.json();
      const jsonBrowser = await jsonBrowserResponse.json();

      if (!jsonBrowser || !jsonPages) {
        throw { message: `Can't connect to ${urlDevtoolsJson}` };
      }

      const webSocketDebuggerUrl = _.get(jsonBrowser, 'webSocketDebuggerUrl');
      if (!webSocketDebuggerUrl) {
        throw { message: `webSocketDebuggerUrl empty. Posibly wrong Electron version running` };
      }

      const browser = await puppeteer.connect({
        browserWSEndpoint: webSocketDebuggerUrl,
        ignoreHTTPSErrors: true,
        slowMo: _.get(browserSettings, 'slowMo', 0),
      });

      let pagesRaw = await browser.pages();
      let pages = {};
      if (pagesRaw.length) {
        pages = { main: pagesRaw[0] };
      } else {
        throw { message: 'Cand find any pages in connection' };
      }

      let width = _.get(browserSettings, 'windowSize.width');
      let height = _.get(browserSettings, 'windowSize.height');
      if (width && height) {
        await pages.main.setViewport({ width: width, height: height });
      }

      // Any tab.
      // const {targetInfos: [{targetId}]} = await browser._connection.send(
      //   'Target.getTargets'
      // );

      // Tab window.
      // const {windowId} = await browser._connection.send(
      //   'Browser.getWindowForTarget',
      //   {targetId}
      // );

      // Resize.
      // await browser._connection.send('Browser.setWindowBounds', {
      //   bounds: {height, width},
      //   windowId
      // });

      return { browser: browser, pages: pages };
    }

    throw { message: `Can't connect to Electron ${urlDevtoolsJson}` };
  }

  async runElectron(browserSettings, env) {
    const runtimeExecutable = _.get(browserSettings, 'runtimeEnv.runtimeExecutable');
    const program = _.get(browserSettings, 'runtimeEnv.program');
    const cwd = _.get(browserSettings, 'runtimeEnv.cwd');
    const browserArgs = _.get(browserSettings, 'runtimeEnv.args', []);
    const browserEnv = _.get(browserSettings, 'runtimeEnv.env', {});
    const pauseAfterStartApp = _.get(browserSettings, 'runtimeEnv.pauseAfterStartApp', 5000);

    if (runtimeExecutable) {
      const run_args = [program, ...browserArgs];
      process.env = Object.assign(process.env, browserEnv);

      let prc = spawn(runtimeExecutable, run_args, { cwd, env: browserEnv });

      if (prc) {
        fs.writeFileSync(path.join(this.output.folder, `${env.name}.log`), '');
        fs.writeFileSync(path.join(this.output.folderLatest, `${env.name}.log`), '');
      }

      prc.stdout.on('data', data => {
        fs.appendFileSync(path.join(this.output.folder, `${env.name}.log`), String(data));
        fs.appendFileSync(path.join(this.output.folderLatest, `${env.name}.log`), String(data));
      });
      await sleep(pauseAfterStartApp);

      let { browser, pages } = await this.connectElectron(browserSettings);
      return { browser, pages, pid: prc.pid };
    } else {
      throw { message: `Can't run Electron ${runtimeExecutable}` };
    }
  }

  async closeBrowsers() {
    for (let i = 0; i < Object.keys(this.envs).length; i++) {
      const key = Object.keys(this.envs)[i];
      const state = this.envs[key].state;
      try {
        state.browser.close();
      } catch (exc) {}
    }
  }

  async closeProcesses() {
    for (let i = 0; i < Object.keys(this.envs).length; i++) {
      const key = Object.keys(this.envs)[i];
      const pid = _.get(this.envs[key], 'state.pid');
      const killOnEnd = _.get(this.envs[key], 'env.browser.killOnEnd', true);
      try {
        if (killOnEnd) {
          spawn('taskkill', ['/pid', pid, '/f', '/t']);
        }
      } catch (exc) {}
    }
  }

  // TODO: Отрефакторить это дело
  async resolveLinks() {
    const args = new Arguments().args;
    const allData = await new TestsContent({ rootFolder: args.PPD_ROOT }).getAllData();

    // ENVS RESOLVING
    args.PPD_ENVS = args.PPD_ENVS.map(v => {
      const env = allData.envs.find(g => g.name === v);
      if (env) {
        const { dataExt, selectorsExt, envsExt } = env;
        envsExt.forEach(d => {
          const envsResolved = allData.envs.find(g => g.name === d, {});
          env.browser = merge(_.get(env, 'browser', {}), _.get(envsResolved, 'browser', {}));
          env.log = merge(_.get(env, 'log', {}), _.get(envsResolved, 'log', {}));
          env.data = merge(_.get(env, 'data', {}), _.get(envsResolved, 'data', {}));
          env.selectors = merge(_.get(env, 'selectors', {}), _.get(envsResolved, 'selectors', {}));
          env.description = _.get(env, 'description', '') + ' -> ' + _.get(envsResolved, 'description', '');
        });
        dataExt.forEach(d => {
          const dataResolved = allData.data.find(g => g.name === d, {});
          env.data = merge(_.get(env, 'data', {}), _.get(dataResolved, 'data', {}));
        });
        selectorsExt.forEach(d => {
          const selectorsResolved = allData.selectors.find(g => g.name === d, {});
          env.selectors = merge(_.get(env, 'selectors', {}), _.get(selectorsResolved, 'data', {}));
        });
        return env;
      } else {
        throw { message: `PuppeDo found unkown environment in yours args. It's name '${v}'.` };
      }
    });

    return args;
  }

  async init(runBrowsers = true) {
    const args = { ...(await this.resolveLinks()) };
    let { PPD_ENVS: envs, PPD_DATA: data, PPD_SELECTORS: selectors } = args;
    this.set('args', args);
    this.set('data', data);
    this.set('selectors', selectors);

    for (let i = 0; i < envs.length; i++) {
      const env = envs[i];
      const name = _.get(env, 'name');

      if (env) {
        env.data = merge(data, env.data || {});
        env.selectors = merge(selectors, env.selectors || {});
      }

      if (name && env) {
        this.envs[name] = new Env(name, env);
      }
    }

    if (!this.envs || _.isEmpty(this.envs)) {
      throw { message: `Can't init any environment. Check 'envs' parameter, should be array` };
    }

    if (runBrowsers) {
      await this.runBrowsers(args);
    }

    // If already init do nothing
    this.init = async function() {};
  }
}

let instances = {};

module.exports = function({ envsId, socket = null } = {}) {
  if (envsId) {
    if (!_.get(instances, envsId)) {
      throw { message: `Unknown ENV ID ${envsId}` };
    }
  } else {
    envsId = crypto.randomBytes(16).toString('hex');
    let newEnvs = new Envs();
    instances[envsId] = { envs: newEnvs, log: logger({ envs: newEnvs, socket, envsId }), socket };
  }
  return {
    envsId,
    envs: _.get(instances, [envsId, 'envs']),
    log: _.get(instances, [envsId, 'log']),
    socket: _.get(instances, [envsId, 'socket']),
  };
};
