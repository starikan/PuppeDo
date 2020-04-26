import path from 'path';
import fs from 'fs';

import _ from 'lodash';
import dayjs from 'dayjs';

import { sleep } from './Helpers';
const Environment = require('./Environment.js');

class Screenshot {
  constructor({ envsId } = {}) {
    const { socket, envs } = Environment({ envsId });
    this.envs = envs;
    this.socket = socket;
  }

  async getScreenshots(element, fullPage = false, extendInfo = false) {
    if (extendInfo) {
      return [];
    }
    const elementScreenshot = await this.saveScreenshot({ element });
    const fullPageScreenshot = await this.saveScreenshot({ fullPage });
    const screenshotsExists = [elementScreenshot, fullPageScreenshot].filter((v) => v);
    return screenshotsExists;
  }

  copyScreenshotToLatest(name) {
    const { folder, folderLatest } = this.envs.getOutputsFolders();
    const pathScreenshot = path.join(folder, name);
    const pathScreenshotLatest = path.join(folderLatest, name);
    fs.copyFileSync(pathScreenshot, pathScreenshotLatest);
  }

  async saveScreenshot({ fullPage = false, element = false } = {}) {
    const { folder } = this.envs.getOutputsFolders();
    try {
      const name = `${dayjs().format('YYYY-MM-DD_HH-mm-ss.SSS')}.png`;
      const pathScreenshot = path.resolve(path.join(folder, name));

      if (fullPage) {
        const page = this.envs.getActivePage();
        await page.screenshot({ path: pathScreenshot, fullPage });
      }

      if (element && _.isObject(element) && !_.isEmpty(element)) {
        await element.screenshot({ path: pathScreenshot });
      }

      if (fs.existsSync(pathScreenshot)) {
        this.copyScreenshotToLatest(name);
        await sleep(25);
        return pathScreenshot;
      }
      return false;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Can not create a screenshot');
      return false;
    }
  }
}

module.exports = { Screenshot };