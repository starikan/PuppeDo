import path from 'path';
import fs from 'fs';

import _ from 'lodash';
import dayjs from 'dayjs';

import { sleep } from './Helpers';
import Environment from './Environment';

type ElementType = {
  screenshot: Function;
} | null;

export default class Screenshot {
  envs: any;
  socket: any;

  constructor({ envsId = null } = {}) {
    const { socket, envs } = Environment(envsId);
    this.envs = envs;
    this.socket = socket;
  }

  async getScreenshots(element: ElementType, fullPage = false, extendInfo = false) {
    if (extendInfo) {
      return [];
    }
    const elementScreenshot = await this.saveScreenshot(element, null);
    const fullPageScreenshot = await this.saveScreenshot(null, fullPage);
    const screenshotsExists = [elementScreenshot, fullPageScreenshot].filter((v) => v);
    return screenshotsExists;
  }

  copyScreenshotToLatest(name: string): void {
    const { folder, folderLatest } = this.envs.getOutputsFolders();
    const pathScreenshot = path.join(folder, name);
    const pathScreenshotLatest = path.join(folderLatest, name);
    fs.copyFileSync(pathScreenshot, pathScreenshotLatest);
  }

  async saveScreenshot(element: ElementType = null, fullPage = false): Promise<string | boolean> {
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
