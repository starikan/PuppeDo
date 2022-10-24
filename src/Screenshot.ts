import path from 'path';
import fs from 'fs';

import { getNowDateTime } from './Helpers';

import { Element, BrowserPageType } from './global.d';
import { Environment } from './Environment';

export default class Screenshot {
  envsId: string;

  constructor(envsId: string) {
    this.envsId = envsId;
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

  static async copyScreenshotToLatest(pathScreenshot: string): Promise<void> {
    const { folderLatest = '.' } = new Environment().getOutput();
    await Screenshot.copyScreenshotToFolder(pathScreenshot, folderLatest);
  }

  getScreenshotName(nameIncome: string): string {
    // TODO: 2022-10-21 S.Starodubov todo
    const { folder = '.' } = new Environment().getOutput(this.envsId);
    const name = `${nameIncome || getNowDateTime()}.png`;
    return path.resolve(path.join(folder, name));
  }

  async saveScreenshotElement(element: Element, name: string, copyToLatest = true): Promise<string> {
    const pathScreenshot = this.getScreenshotName(name);

    try {
      if (element) {
        await element.screenshot({ path: pathScreenshot });
        if (copyToLatest) {
          await Screenshot.copyScreenshotToLatest(pathScreenshot);
        }
        return pathScreenshot;
      }
    } catch (error) {
      // Nothing to do
    }

    return '';
  }

  async saveScreenshotFull(name: string, copyToLatest = true): Promise<string> {
    const pathScreenshot = this.getScreenshotName(name);

    try {
      const page = new Environment().getEnvRunners(this.envsId).getActivePage() as BrowserPageType;
      if (page) {
        await page.screenshot({ path: pathScreenshot, fullPage: true });
        if (copyToLatest) {
          await Screenshot.copyScreenshotToLatest(pathScreenshot);
        }
        return pathScreenshot;
      }
    } catch (error) {
      // Nothing to do
    }

    return '';
  }
}
