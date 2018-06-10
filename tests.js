const _ = require('lodash');

const env = require('./env');
const { typeInput, buttonClick, wait } = require('./helpers');
const { log } = require('./logger');

async function login({pageNum = 0} = {}) {
  await log({ text: 'LOGIN', isScreenshot: true });
  page = env.get(`pages.${pageNum}`);

  if (page) {
    await typeInput({ selCSS: env.get('selectors.auth.inputLogin'), text: env.get('auth.login'), isScreenshot: true });
    await typeInput({ selCSS: env.get('selectors.auth.inputPassword'), text: env.get('auth.password'), isScreenshot: true });
    await buttonClick({ selCSS: env.get('selectors.auth.inputSubmit'), isScreenshot: true });
    await wait({ navigation: 'load', pageNum: pageNum });
  }
  
  await log({ text: 'LOGIN DONE', isScreenshot: true });
}

module.exports = {
  login
};