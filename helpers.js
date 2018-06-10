const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const moment = require('moment')
const puppeteer = require('puppeteer');

const env = require('./env')

const { log } = require('./logger/logger');

async function init({ output = 'output', name = 'test' } = {}) {
  if (!fs.existsSync(output)) {
    await fs.mkdirSync(output);
  };
  const now = moment().format('YYYY-MM-DD_HH-mm-ss.SSS');
  const outDir = path.join(output, `/${name}_${now}`);
  await fs.mkdirSync(outDir);

  env.set("outDir", outDir);
  env.set("outName", name);

  fs.createReadStream('./logger/output.html').pipe(fs.createWriteStream(path.join(outDir, 'output.html')));
}

async function start({} = {}) {

  await log({ text: 'START' });

  const browser = await puppeteer.launch({
    headless: env.get("headless", true),
    slowMo: env.get("slowMo", 0),
    args: env.get("args", [])
  });

  const page = await browser.newPage();
  const override = Object.assign(page.viewport(), env.get('windowSize'));
  await page.setViewport(override);
  await log({ text: 'Init page' });

  await page.goto(env.get('baseUrl'));
  env.set('browser', browser);
  env.set('pages', [page]);
  await log({ text: `Go to: ${env.get('baseUrl')}` });
}

async function end() {
  await log({ text: 'END' });
  await env.browser.close();
}

async function wait ({time = 0, timeout = 0, pageNum = 0, selector = false, selectorVisible = false, selectorHidden = false, navigation = false} = {}) {
  page = env.get(`pages.${pageNum}`);
  if (selector) {
    await page.waitForSelector( 
      selector, 
      {
        visible: selectorVisible,
        hidden: selectorHidden,
        timeout: timeout
      } 
    );
  }
  if (navigation) {
    await page.waitForNavigation({ waitUntil: navigation });
  }
  if (time) {

  }
}

module.exports = {
  init,
  start,
  end,
  wait
}