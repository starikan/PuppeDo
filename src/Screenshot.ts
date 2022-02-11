import path from 'path';
import fs from 'fs';

import { blankSocket, getNowDateTime } from './Helpers';

import { EnvsPoolType, SocketType, Element, BrowserPageType } from './global.d';

export default class Screenshot {
  envs: EnvsPoolType;
  socket: SocketType;

  constructor(envsPool: EnvsPoolType, socket: SocketType = blankSocket) {
    this.envs = envsPool;
    this.socket = socket;
  }

  static async copyScreenshotToFolder(pathScreenshot: string, folder: string, name = ''): Promise<void> {
    const fileName = name ? name + path.extname(pathScreenshot) : path.basename(pathScreenshot);
    const pathScreenshotNew = path.join(folder, fileName);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    if (fs.existsSync(pathScreenshot)) {
      fs.copyFileSync(pathScreenshot, pathScreenshotNew);
    }
  }

  async copyScreenshotToLatest(pathScreenshot: string): Promise<void> {
    const { folderLatest = '.' } = this.envs.output;
    await Screenshot.copyScreenshotToFolder(pathScreenshot, folderLatest);
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
