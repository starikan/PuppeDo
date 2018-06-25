const env = require('../env')

async function end() {
  await log({ text: 'END' });
  await env.browser.close();
}

module.exports = end;
