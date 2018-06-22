const env = require('../env')

const { log } = require('../logger/logger');

async function typeInput(
  {
    data = [],
    selCSS = "", 
    selXPath = "", 
    text = "", 
  } = {},
  { 
    repeat = 1,
    pageNum = 0, 
    waitTime = 0, 
    isScreenshot = false,
    isFullScreenshot = false 
  } = {}
) {

  page = env.get(`pages.${pageNum}`);

  if (page) {
    if (selCSS) {
      await page.type(selCSS, text);
    }
    await page.waitFor(waitTime);

    await log({ 
      text: `Ввод текста в INPUT = ${selCSS}, TEXT = ${text}`, 
      selCSS: [selCSS],  
      isScreenshot: isScreenshot, 
      isFullScreenshot: isFullScreenshot,
      type: 'debug'
     });
  };
};

module.exports = typeInput;