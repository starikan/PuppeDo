const env = require('../env')

const { log } = require('../logger/logger');

async function abstractTest(
  {
    // Если null то не какие данные не биндим
    // Если строка то выжираем м env
    // Если объект то используется только он для данных
    data = null,
    // Если null то не какие данные не биндим
    // Если строка то выжираем м env
    // Если объект то используется только он
    selectors = null, 
  } = {},
  { 
    envName,
    repeat = 1,
    pageNum = 0, 
    waitTime = 0, 
    isScreenshot = false,
    isFullScreenshot = false 
  } = {}
) {

  if (envName) {
    e = env.get('envName')
  }

  // require browser type
  // require exists browser and page
  // require env

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
      level: 'debug'
     });
  };
};

module.exports = typeInput;