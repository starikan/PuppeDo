const env = require('../env')

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

module.exports = wait;
