const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const moment = require('moment')

const env = require('../env')

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

async function log({ 
    text = '', 
    pageNum = 0, 
    stdOut = true, 
    selCSS = [], 
    isScreenshot = false, 
    isFullScreenshot = false, 
    type = 'info' 
  } = {}) {
  const now = moment().format('YYYY-MM-DD_HH-mm-ss.SSS');
  const logStringNoTime = `${type} - ${pageNum} - ${text}`;
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
    
    env.push('log', { 
      text: logStringNoTime, 
      time: now, screenshots: 
      screenshots, 
      type: type 
    });

    await fs.appendFileSync(path.join(env.get('outDir'), 'output.log'), logString + '\n', function (err) {
      if (err) {
        return console.log(err);
      }
    });

    // Export JSON log every step
    const exportJson = JSON.stringify(env.get('log'));
    await fs.writeFileSync(path.join(env.get('outDir'), 'output.json'), exportJson);

  };

  if (stdOut) {
    console.log(logString)
  }
}

module.exports = {
  log
};