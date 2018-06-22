const env = require('../env')

const { log } = require('../logger/logger');

async function typeInput(
  { 
    selCSS = "", 
    selXPath = "", 
    text = "", 
    pageNum = 0, 
    waitTime = 0, 
    isScreenshot = false,
    isFullScreenshot = false 
  } = {}, 
  {
    // repeat = 1,
    data = []
  } = {}
) {

  page = env.get(`pages.${pageNum}`);

  if (page) {
    if (selCSS) {
      await page.type(selCSS, text);
    }
    await page.waitFor(waitTime);

    await log({ text: `Ввод текста в INPUT = ${selCSS}, TEXT = ${text}`, selCSS: [selCSS],  isScreenshot: isScreenshot, isFullScreenshot: isFullScreenshot });
  };
};

module.exports = typeInput;