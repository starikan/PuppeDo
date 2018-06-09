const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const moment = require('moment')
const puppeteer = require('puppeteer');

const env = require('./env')

async function typeInput({ selCSS = "", selXPath = "", text = "", pageNum = 0, waitTime = 0, isScreenshot = false, isFullScreenshot = false } = {}) {
  if (_.get(env, ['pages', pageNum])) {
    page = _.get(env, ['pages', pageNum]);
    if (selCSS) {
      await page.type(selCSS, text);
    }
    await page.waitFor(waitTime);

    await log({ text: `Ввод текста в INPUT = ${selCSS}, TEXT = ${text}`, selCSS: [selCSS],  isScreenshot: isScreenshot, isFullScreenshot: isFullScreenshot });
  };
};

async function buttonClick({ selCSS = "", selXPath = "", pageNum = 0, waitTime = 0, isScreenshot = false, isFullScreenshot = false } = {}) {
  page = env.get(`pages.${pageNum}`);
  if (page) {
    await log({ text: `Нажата кнопка ${selCSS}`, selCSS: [selCSS], isScreenshot: isScreenshot, isFullScreenshot: isFullScreenshot });
    await page.click(selCSS);
  }
};

async function saveScreenshot({ pageNum = 0, selCSS = false } = {}) {
  const now = moment().format('YYYY-MM-DD_HH-mm-ss.SSS');
  const name = `${now}_${pageNum}_${env.get("outName")}.jpg`;

  const pathScreenshot = path.join(env.get('outDir'), name);
  const page = env.get(`pages.${pageNum}`)

  if (_.get(env, 'screenshots.isScreenshot') && _.get(env, 'outDir') && _.get(env, ['pages', pageNum])) {
    if (selCSS) {
      const element = await page.$(selCSS);
      await element.screenshot({ path: pathScreenshot });
    } else {
      await page.screenshot({ path: pathScreenshot, fullPage: env.get('screenshots.fullPage') });
    }
    return name;
  } else {
    return false;
  };
};

async function createHTML({} = {}) {
  const logs = env.get('log');

  let html = `
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table td, table th {
      border: 1px solid #000000;
    }
  </style>
  <table>`;

  _.forEach(logs, (v, i) => {
    const text = _.get(v, 'text');
    const screenshots = _.get(v, "screenshots");

    html += `
      <tr> 
        <td>${i}</td>
        <td>${v.time}</td>
        <td><p>${text}</p>
    `;

    _.forEach(screenshots, src => {
      html += `<img src=${src}>`
    })

    html += '</td>'
  })

  html += '</table>'

  await fs.appendFileSync(path.join(env.get('outDir'), env.get('outName') + '.html'), html, function (err) {
    if (err) {
      return console.log(err);
    }
  });
}

async function log({ text = '', pageNum = 0, stdOut = true, selCSS = [], isScreenshot = false, isFullScreenshot = false } = {}) {
  const now = moment().format('YYYY-MM-DD_HH-mm-ss.SSS');
  const logStringNoTime = `${pageNum} - ${text}`;
  const logString = `${now} - ${logStringNoTime}`;
  const screenshots = [];

  if (env.get('outDir') && env.get('outName')) {
    if (_.isArray(selCSS) && !_.isEmpty(selCSS) && isScreenshot) {
      for (let css in selCSS) {
        const src = await saveScreenshot({ selCSS: selCSS[css], pageNum: pageNum });
        if (src) {
          screenshots.push(src);
        }
      }
    } else if (isScreenshot) {
      const src = await saveScreenshot({ pageNum: pageNum });
      if (src) {
        screenshots.push(src);
      }
    }
    
    // if (isFullScreenshot) {
    //   const src = await saveScreenshot({ pageNum: pageNum });
    //   if (src) {
    //     screenshots.push(src);
    //   }
    // }

    await fs.appendFileSync(path.join(env.get('outDir'), env.get('outName') + '.log'), logString + '\n', function (err) {
      if (err) {
        return console.log(err);
      }
    });

    env.push('log', { text: logStringNoTime, time: now, screenshots: screenshots });
  };

  if (stdOut) {
    console.log(logString)
  }
}

async function init({ output = 'output', name = 'test' } = {}) {
  if (!fs.existsSync(output)) {
    await fs.mkdirSync(output);
  };
  const now = moment().format('YYYY-MM-DD_HH-mm-ss.SSS');
  const outDir = path.join(output, `/${name}_${now}`);
  await fs.mkdirSync(outDir);

  env.set("outDir", outDir);
  env.set("outName", name);
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

  // await saveScreenshot();
}

async function end() {
  await log({ text: 'END' });
  await env.browser.close();
  await createHTML()
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
  typeInput,
  buttonClick,
  saveScreenshot,
  init,
  createHTML,
  log,
  start,
  end,
  wait
}