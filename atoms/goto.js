const env = require('../env')

const { log } = require('../logger/logger');

async function goTo(
  { 
    data = [],
    url = ''
  } = {}, 
  {
    waitTime = 0, 
    isScreenshot = false, 
    isFullScreenshot = false,
  } = {}
) {
  let browser = env.getCurr();
  let baseUrl = browser.data.baseUrl + url;

  if (browser.page && baseUrl) {
    await browser.page.goto(baseUrl);
    await log({ text: `Go to: ${baseUrl}` });
  }
};

module.exports = goTo;