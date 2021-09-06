import path from 'path';
import fs from 'fs';

import { getNowDateTime } from './Helpers';

import { EnvsPoolType, SocketType, Element, BrowserPageType } from './global.d';

export default class Screenshot {
  envs: EnvsPoolType;
  socket: SocketType;

  constructor(envsPool: EnvsPoolType, socket: SocketType) {
    this.envs = envsPool;
    this.socket = socket;
  }

  async copyScreenshotToLatest(pathScreenshot: string): Promise<void> {
    const { folderLatest = '.' } = this.envs.output;
    const pathScreenshotLatest = path.join(folderLatest, path.basename(pathScreenshot));
    if (fs.existsSync(pathScreenshot)) {
      fs.copyFileSync(pathScreenshot, pathScreenshotLatest);
    }
  }

  getScreenshotName(nameIncome: string): string {
    const { folder = '.' } = this.envs.output;
    const name = `${nameIncome || getNowDateTime()}.png`;
    return path.resolve(path.join(folder, name));
  }

  async saveScreenshotElement(element: Element, name: string): Promise<string> {
    const pathScreenshot = this.getScreenshotName(name);

    try {
      if (element) {
        await element.screenshot({ path: pathScreenshot });
        await this.copyScreenshotToLatest(pathScreenshot);
        return pathScreenshot;
      }
    } catch (error) {
      // Nothing to do
    }

    return '';
  }

  async saveScreenshotFull(name: string): Promise<string> {
    const pathScreenshot = this.getScreenshotName(name);

    try {
      const page = this.envs.getActivePage() as BrowserPageType;
      if (page) {
        await page.screenshot({ path: pathScreenshot, fullPage: true });
        await this.copyScreenshotToLatest(pathScreenshot);
        return pathScreenshot;
      }
    } catch (error) {
      // Nothing to do
    }

    return '';
  }
}
