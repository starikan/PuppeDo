import path from 'path';
import fs from 'fs';

import { getNowDateTime, sleep } from './Helpers';

import { EnvsPoolType, SocketType, Element } from './global.d';

export default class Screenshot {
  envs: EnvsPoolType;
  socket: SocketType;

  constructor(envsPool: EnvsPoolType, socket: SocketType) {
    this.envs = envsPool;
    this.socket = socket;
  }

  async getScreenshots(element: Element | null, fullPage = false, extendInfo = false): Promise<Array<string>> {
    if (extendInfo || !element) {
      return [];
    }
    const elementScreenshot = await this.saveScreenshot(element, false);
    const fullPageScreenshot = await this.saveScreenshot(null, fullPage);
    const screenshotsExists = [elementScreenshot, fullPageScreenshot].filter((v) => !!v);
    return screenshotsExists;
  }

  copyScreenshotToLatest(name: string): void {
    const { folder, folderLatest } = this.envs.output;
    const pathScreenshot = path.join(folder, name);
    const pathScreenshotLatest = path.join(folderLatest, name);
    fs.copyFileSync(pathScreenshot, pathScreenshotLatest);
  }

  async saveScreenshot(element: Element = null, fullPage: boolean = false): Promise<string> {
    const { folder } = this.envs.output;
    try {
      const name = `${getNowDateTime()}.png`;
      const pathScreenshot = path.resolve(path.join(folder, name));

      if (fullPage) {
        const page = this.envs.getActivePage();
        await page.screenshot({ path: pathScreenshot, fullPage });
      }

      try {
        if (element && !Object.keys(element).length) {
          await element.screenshot({ path: pathScreenshot });
        }
      } catch (error) {
        // eslint-disable-next-line no-empty
      }

      if (fs.existsSync(pathScreenshot)) {
        this.copyScreenshotToLatest(name);
        await sleep(25);
        return pathScreenshot;
      }
      return '';
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Can not create a screenshot');
      return '';
    }
  }
}
