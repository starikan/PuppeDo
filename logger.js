const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const moment = require('moment')

const env = require('./env')

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

module.exports = {
  log,
  createHTML
};