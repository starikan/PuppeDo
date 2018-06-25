const env = require('../env')
const { log } = require('../logger/logger');

async function end( {envName} = {} ) {
  await log({ text: 'END' });
  let browser = env.getCurr().browser;
  await browser.close();
}

module.exports = end;
