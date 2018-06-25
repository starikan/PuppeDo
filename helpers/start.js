const puppeteer = require('puppeteer');

const env = require('../env')
const { log } = require('../logger/logger');

async function start({envName} = {}) {

  await log({ text: 'START' });

  const browserEnv = env.get(`browsers.${envName}`, null);

  if (!browserEnv){
    throw `No env ${envName}`
  }

  if (browserEnv.type === 'puppeteer'){
    const browser = await puppeteer.launch({
      headless: env.get("headless", true),
      slowMo: env.get("slowMo", 0),
      args: env.get("args", [])
    });
  
    const page = await browser.newPage();
    const override = Object.assign(page.viewport(), env.get('windowSize'));
    await page.setViewport(override);
    env.set(`browsers.${envName}`, {
      'browser': browser,
      'pages': [page]
    });

    env.set('current', {
      envName: envName,
      pageNum: 0
    })
  }

  await log({ text: `Init browser ${envName}` });
}

module.exports = start;
