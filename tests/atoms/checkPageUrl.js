module.exports = {
  runTest: async function(args) {
    const { browser, data, log, levelIndent } = args;
    //TODO: 2018-08-14 S.Starodubov сделать нормальный скриншот страницы которая открывается

    const allPages = await browser.pages();
    const url = data.url;
    let isUrlExist = false;

    allPages.forEach(page => {
      if (page.url().includes(url)) {
        isUrlExist = true;
      }
    });

    //TODO: 2019-04-29 S.Starodubov отрефкторить этот кусок
    if (isUrlExist) {
      await log({
        text: `Страница найдена URL = ${url}`,
        screenshot: false,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    } else {
      await log({
        text: `Страница НЕ найдена URL = ${url}`,
        screenshot: false,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    }
  },
};
