module.exports = {
  runTest: async function ({env, browser, page, data, selectors, results, log}) {

    //TODO: 2018-08-14 S.Starodubov сделать нормальный скриншот страницы которая открывается

    const allPages = await browser.pages();
    const url = data.url;
    let isUrlExist = false;
    allPages.forEach(page => {
      if (page.url().includes(url)){
        isUrlExist = true;
      }
    });

    if (isUrlExist) {
      await log({
        text: `Страница найдена URL = ${url}`,
        screenshot: false,
        level: 'raw'
      });
    }

    else {
      await log({
        text: `Страница НЕ найдена URL = ${url}`,
        screenshot: false,
        level: 'raw'
      });
    }
  }
};