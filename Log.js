const path = require('path');
const fs = require('fs');

const _ = require('lodash');
require('polyfill-object.fromentries');
require('array-flat-polyfill');
const dayjs = require('dayjs');
const yaml = require('js-yaml');

const { sleep, stylesConsole, blankSocket } = require('./helpers');
const Singleton = require('./singleton');

class Log extends Singleton {
  constructor({ envs, envsId, socket = blankSocket } = {}, reInit = false) {
    super();
    if (reInit || !this.envs) {
      return this.init(args);
    }
    return this.args;
  }

  init(args) {
    return this.args;
  }
}

module.exports = {
  Log,
};
