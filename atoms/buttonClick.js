const env = require('../env')

const { log } = require('../logger/logger');

async function buttonClick(
  { 
    data = [],
    selCSS = "", 
    selXPath = "", 
  } = {}, 
  {
    repeat = 1,
    pageNum = 0, 
    waitTime = 0, 
    isScreenshot = false, 
    isFullScreenshot = false,
  } = {}
) {
  page = env.get(`pages.${pageNum}`);
  if (page) {
    await log({ 
      text: `Нажата кнопка ${selCSS}`, 
      selCSS: [selCSS], 
      isScreenshot: isScreenshot, 
      isFullScreenshot: isFullScreenshot,
      level: 'debug'
     });
    await page.click(selCSS);
  }
};

module.exports = buttonClick;