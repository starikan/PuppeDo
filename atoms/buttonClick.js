const env = require('../env')

const { log } = require('../logger/logger');

async function buttonClick({ selCSS = "", selXPath = "", pageNum = 0, waitTime = 0, isScreenshot = false, isFullScreenshot = false } = {}) {
  page = env.get(`pages.${pageNum}`);
  if (page) {
    await log({ text: `Нажата кнопка ${selCSS}`, selCSS: [selCSS], isScreenshot: isScreenshot, isFullScreenshot: isFullScreenshot });
    await page.click(selCSS);
  }
};

module.exports = buttonClick;