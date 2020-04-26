/* eslint-disable no-await-in-loop */
import fs from 'fs';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import crypto from 'crypto';

import _ from 'lodash';
import dayjs from 'dayjs';
import fetch from 'node-fetch';
import walkSync from 'walk-sync';

/* eslint-disable */
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (error) {}

let playwright;
try {
  playwright = require('playwright');
} catch (error) {}
/* eslint-enaable */

import { merge, sleep, blankSocket } from './Helpers';
import TestsContent from './TestContent';
import Arguments from './Arguments';
import Env from './Env';

class Envs {
  envs: any;
  data: any;
  selectors: any;
  current: any;
  results: any;
  output: any;
  log: any;

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
    const arr = _.clone(this.get(name, []));
    try {
      arr.push(data);
    } catch (err) {
      /* eslint-disable no-console */
      console.log('class Envs -> push');
      console.log(err);
      /* eslint-enable no-console */
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
    const nameNew = name || _.get(this, 'current.name');
    return _.get(this.envs, nameNew, {});
  }

  getActivePage() {
    const activeEnv = this.getEnv();
    const pageName = _.get(this, 'current.page');
    return _.get(activeEnv, `state.pages.${pageName}`);
  }

  getOutputsFolders() {
    const { folder, folderLatest } = _.get(this, 'output', {});
    if (!folder || !folderLatest) {
      throw new Error('There is no output folder');
    }
    return { folder, folderLatest };
  }

  initOutput(testName = 'test') {
    const { PPD_OUTPUT: output } = new Arguments().args;
    const currentTest = this.get('current.test') || testName;

    if (!fs.existsSync(output)) {
      fs.mkdirSync(output);
    }
    const now = dayjs().format('YYYY-MM-DD_HH-mm-ss.SSS');

    const folder = path.join(output, `${now}_${currentTest}`);
    fs.mkdirSync(folder);

    fs.copyFileSync(path.join(path.resolve(__dirname), 'output.html'), path.join(folder, 'output.html'));

    this.output.output = output;
    this.output.name = currentTest;
    this.output.folder = folder;
    this.output.folderFull = path.resolve(folder);

    this.initOutputLatest();

    this.initOutput = () => {};
  }

  initOutputLatest() {
    const { PPD_OUTPUT: output } = new Arguments().args;

    const folderLatest = path.join(output, 'latest');

    if (!fs.existsSync(output)) {
      fs.mkdirSync(output);
    }

    // Create latest log path
    if (!fs.existsSync(folderLatest)) {
      fs.mkdirSync(folderLatest);
    } else {
      const filesExists = walkSync(folderLatest);
      for (let i = 0; i < filesExists.length; i += 1) {
        fs.unlinkSync(path.join(folderLatest, filesExists[i]));
      }
    }

    fs.copyFileSync(path.join(path.resolve(__dirname), 'output.html'), path.join(folderLatest, 'output.html'));

    this.output.folderLatest = folderLatest;
    this.output.folderLatestFull = path.resolve(folderLatest);

    // Drop this function after first use
    this.initOutputLatest = () => {};
  }

  async runBrowsers() {
    const envsNames = Object.keys(this.envs);
    for (let i = 0; i < envsNames.length; i += 1) {
      const env = this.envs[envsNames[i]];

      const browserSettings = _.get(env, 'env.browser', {});
      const { type = 'browser', engine = 'playwright', runtime = 'run' } = browserSettings;

      if (
        !['api', 'browser', 'electron'].includes(type) ||
        !['puppeteer', 'playwright'].includes(engine) ||
        !['run', 'connect'].includes(runtime)
      ) {
        throw new Error(`Error in environment browser parametr: '${JSON.stringify(browserSettings)}'`);
      }

      if (type === 'api') {
        // TODO: 2020-01-13 S.Starodubov
      }

      if (type === 'browser') {
        if (runtime === 'run') {
          if (engine === 'puppeteer') {
            const { browser, pages } = await Envs.runPuppeteer(browserSettings);
            env.state = { ...env.state, ...{ browser, pages } };
          }
          else {
            const { browser, pages } = await Envs.runPlaywright(browserSettings);
            env.state = { ...env.state, ...{ browser, pages } };
          }
        }
      }

      if (type === 'electron') {
        if (runtime === 'connect') {
          const { browser, pages } = await Envs.connectElectron(browserSettings);
          env.state = { ...env.state, ...{ browser, pages } };
        }
        if (runtime === 'run') {
          const { browser, pages, pid } = await this.runElectron(browserSettings, env);
          env.state = { ...env.state, ...{ browser, pages, pid } };
        }
      }
    }

    this.runBrowsers = () => {};
  }

  static async runPuppeteer(browserSettings) {
    const { PPD_DEBUG_MODE = false } = new Arguments().args;
    const { headless = true, slowMo = 0, args = [] } = browserSettings;

    const browser = await puppeteer.launch({ headless, slowMo, args, devtools: PPD_DEBUG_MODE });

    const page = await browser.newPage();
    const pages = { main: page };

    const { width, height } = _.get(browserSettings, 'windowSize');
    if (width && height) {
      await pages.main.setViewport({ width, height });
    }

    return { browser, pages };
  }

  static async runPlaywright(browserSettings) {
    const { PPD_DEBUG_MODE = false } = new Arguments().args;
    const { headless = true, slowMo = 0, args = [], browser: browserName } = browserSettings;
    const { width = 1024, height = 768 } = _.get(browserSettings, 'windowSize');

    const options = { headless, slowMo, args };
    if (browserName === 'chromium') {
      options.devtools = PPD_DEBUG_MODE;
    }

    const browser = await playwright[browserName].launch(options);
    const context = await browser.newContext();
    const page = await context.newPage({ viewport: { width, height } });

    const pages = { main: page };
    const contexts = { main: context };

    return { browser, contexts, pages };
  }

  static async connectElectron(browserSettings) {
    const urlDevtoolsJson = _.get(browserSettings, 'urlDevtoolsJson');

    if (urlDevtoolsJson) {
      const jsonPagesResponse = await fetch(`${urlDevtoolsJson}json`, { method: 'GET' });
      const jsonBrowserResponse = await fetch(`${urlDevtoolsJson}json/version`, { method: 'GET' });

      const jsonPages = await jsonPagesResponse.json();
      const jsonBrowser = await jsonBrowserResponse.json();

      if (!jsonBrowser || !jsonPages) {
        throw new Error(`Can't connect to ${urlDevtoolsJson}`);
      }

      const webSocketDebuggerUrl = _.get(jsonBrowser, 'webSocketDebuggerUrl');
      if (!webSocketDebuggerUrl) {
        throw new Error('webSocketDebuggerUrl empty. Possibly wrong Electron version running');
      }

      const browser = await puppeteer.connect({
        browserWSEndpoint: webSocketDebuggerUrl,
        ignoreHTTPSErrors: true,
        slowMo: _.get(browserSettings, 'slowMo', 0),
      });

      const pagesRaw = await browser.pages();
      let pages = {};
      if (pagesRaw.length) {
        pages = { main: pagesRaw[0] };
      } else {
        throw new Error('Can`t find any pages in connection');
      }

      const { width, height } = _.get(browserSettings, 'windowSize');
      if (width && height) {
        await pages.main.setViewport({ width, height });
      }

      return { browser, pages };
    }

    throw new Error(`Can't connect to Electron ${urlDevtoolsJson}`);
  }

  async runElectron(browserSettings, env) {
    const runtimeExecutable = _.get(browserSettings, 'runtimeEnv.runtimeExecutable');
    const program = _.get(browserSettings, 'runtimeEnv.program');
    const cwd = _.get(browserSettings, 'runtimeEnv.cwd');
    const browserArgs = _.get(browserSettings, 'runtimeEnv.args', []);
    const browserEnv = _.get(browserSettings, 'runtimeEnv.env', {});
    const pauseAfterStartApp = _.get(browserSettings, 'runtimeEnv.pauseAfterStartApp', 5000);
    const runArgs = [program, ...browserArgs];

    if (runtimeExecutable) {
      process.env = { ...process.env, ...browserEnv };

      const prc = spawn(runtimeExecutable, runArgs, { cwd, env: process.env });

      if (prc) {
        fs.writeFileSync(path.join(this.output.folder, `${env.name}.log`), '');
        fs.writeFileSync(path.join(this.output.folderLatest, `${env.name}.log`), '');

        prc.stdout.on('data', (data) => {
          fs.appendFileSync(path.join(this.output.folder, `${env.name}.log`), String(data));
          fs.appendFileSync(path.join(this.output.folderLatest, `${env.name}.log`), String(data));
        });
      }

      await sleep(pauseAfterStartApp);

      const { browser, pages } = await Envs.connectElectron(browserSettings);
      return { browser, pages, pid: prc.pid };
    }
    throw new Error(`Can't run Electron ${runtimeExecutable}`);
  }

  async closeBrowsers() {
    for (let i = 0; i < Object.keys(this.envs).length; i += 1) {
      const key = Object.keys(this.envs)[i];
      const { state } = this.envs[key];
      try {
        state.browser.close();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    }
  }

  async closeProcesses() {
    for (let i = 0; i < Object.keys(this.envs).length; i += 1) {
      const key = Object.keys(this.envs)[i];
      const killOnEnd = _.get(this.envs[key], 'env.browser.killOnEnd', true);
      const killProcessName = _.get(this.envs[key], 'env.browser.killProcessName');
      try {
        if (killOnEnd && killProcessName) {
          spawnSync('taskkill', ['/f', '/im', killProcessName]);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    }
  }

  static async resolveLinks() {
    const args = new Arguments().args;
    const allData = new TestsContent().allData;

    // ENVS RESOLVING
    args.PPD_ENVS = args.PPD_ENVS.map((v) => {
      const env = _.cloneDeep(allData.envs.find((g) => g.name === v));
      if (env) {
        const { dataExt = [], selectorsExt = [], envsExt = [], data = {}, selectors = {} } = env;
        envsExt.forEach((d) => {
          const envsResolved = { ...allData.envs.find((g) => g.name === d, {}) };
          env.browser = merge(_.get(env, 'browser', {}), _.get(envsResolved, 'browser') || {});
          env.log = merge(_.get(env, 'log', {}), _.get(envsResolved, 'log') || {});
          env.data = merge(_.get(env, 'data', {}), _.get(envsResolved, 'data') || {});
          env.selectors = merge(_.get(env, 'selectors', {}), _.get(envsResolved, 'selectors') || {});
          env.description = `${_.get(env, 'description', '')} -> ${_.get(envsResolved, 'description', '')}`;
        });
        dataExt.forEach((d) => {
          const dataResolved = { ...allData.data.find((g) => g.name === d, {}) };
          env.data = merge(_.get(env, 'data', {}), _.get(dataResolved, 'data') || {}, data);
        });
        selectorsExt.forEach((d) => {
          const selectorsResolved = { ...allData.selectors.find((g) => g.name === d, {}) };
          env.selectors = merge(_.get(env, 'selectors', {}), _.get(selectorsResolved, 'data') || {}, selectors);
        });
        return env;
      }
      throw new Error(`PuppeDo found unknown environment in yours args. It's name '${v}'.`);
    });

    return args;
  }

  async init(runBrowsers = true) {
    const args = { ...(await Envs.resolveLinks()) };
    const { PPD_ENVS: envs, PPD_DATA: data, PPD_SELECTORS: selectors } = args;
    this.set('args', args);
    this.set('data', data);
    this.set('selectors', selectors);

    for (let i = 0; i < envs.length; i += 1) {
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
      throw new Error("Can't init any environment. Check 'envs' parameter, should be array");
    }

    if (runBrowsers) {
      await this.runBrowsers();
    }

    // If already init do nothing
    this.init = () => {};
  }
}

const instances = {};

export default ({ envsId, socket = blankSocket } = {}) => {
  let envsIdLocal = envsId;
  if (envsIdLocal) {
    if (!_.get(instances, envsIdLocal)) {
      throw new Error(`Unknown ENV ID ${envsIdLocal}`);
    }
  } else {
    envsIdLocal = crypto.randomBytes(16).toString('hex');
    const newEnvs = new Envs();
    instances[envsIdLocal] = { envs: newEnvs, socket };
  }

  return {
    envsId: envsIdLocal,
    envs: _.get(instances, [envsIdLocal, 'envs']),
    socket: _.get(instances, [envsIdLocal, 'socket']),
  };
};
