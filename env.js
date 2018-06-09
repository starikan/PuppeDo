const _ = require('lodash');

let args = {}
_.forEach(process.argv.slice(2), v => {
  let data = v.split(" ");
  args[data[0]] = data[1];
});

let envDefault = {
  headless: false,
  slowMo: 10,
  windowSize: {
    width: 1024,
    height: 768
  },
  args: [
    `--window-size=${ 1024 },${ 768 + 150 }`
  ],
  screenshots: {
    isScreenshot: true,
    fullPage: true,
  },
}

const envJson = _.get(args, '--env') ? require(_.get(args, '--env')) : {}
const selectorsJson = _.get(args, '--selectors') ? require(_.get(args, '--selectors')) : {}

let env = Object.assign(envDefault, envJson);

env.set = function (name, data) {
  return _.set(this, name, data);
}

env.get = function (name, def = false) {
  return _.get(this, name, def);
}

env.push = function (name, data) {
  let arr = _.clone(this.get(name, []));
  arr.push(data);
  return _.set(this, name, arr);
}

env.set("selectors", selectorsJson);

module.exports = env;