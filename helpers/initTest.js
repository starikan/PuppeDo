const fs = require('fs');
const path = require('path');

const env = require('../env')
const moment = require('moment')

async function initTest({ output = 'output', name = 'test' } = {}, {} = {}) {
  if (!fs.existsSync(output)) {
    await fs.mkdirSync(output);
  };

  if (!env.get('outDir') && !env.get('outName')){
    const now = moment().format('YYYY-MM-DD_HH-mm-ss.SSS');
    const outDir = path.join(output, `/${name}_${now}`);
    await fs.mkdirSync(outDir);
  
    env.set("outDir", outDir);
    env.set("outName", name);
  
    fs.createReadStream('./logger/output.html').pipe(fs.createWriteStream(path.join(outDir, 'output.html')));
  }
}

module.exports = initTest;
