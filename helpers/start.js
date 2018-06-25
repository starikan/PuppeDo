const puppeteer = require('puppeteer');

const env = require('../env')
const { log } = require('../logger/logger');

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

module.exports = start;
