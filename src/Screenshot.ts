import fs from 'fs';
import path from 'path';
import { Environment } from './Environment';
import { getNowDateTime } from './Helpers';
import type { BrowserPageType, Element } from './model';

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

  async copyScreenshotToLatest(pathScreenshot: string): Promise<void> {
    const { folderLatest = '.' } = new Environment().getOutput(this.envsId);
    await Screenshot.copyScreenshotToFolder(pathScreenshot, folderLatest);
  }

  getScreenshotName(nameIncome?: string): string {
    // TODO: 2022-10-21 S.Starodubov todo
    const { folder = '.' } = new Environment().getOutput(this.envsId);
    const name = `${nameIncome || getNowDateTime()}.png`;
    return path.resolve(path.join(folder, name));
  }

  async saveScreenshotElement(element: Element, name?: string, copyToLatest = true): Promise<string> {
    const pathScreenshot = this.getScreenshotName(name);

    try {
      if (element) {
        await element.screenshot({ path: pathScreenshot });
        if (copyToLatest) {
          await this.copyScreenshotToLatest(pathScreenshot);
        }
        return pathScreenshot;
      }
    } catch {
      // Nothing to do
    }

    return '';
  }

  async saveScreenshotFull(nameIncome?: string, copyToLatest = true): Promise<string> {
    const name = `${nameIncome || getNowDateTime()}_full.png`;
    const pathScreenshot = this.getScreenshotName(name);

    try {
      const page = new Environment().getEnvRunners(this.envsId).getActivePage() as BrowserPageType;
      if (page) {
        await page.screenshot({ path: pathScreenshot, fullPage: true });
        if (copyToLatest) {
          await this.copyScreenshotToLatest(pathScreenshot);
        }
        return pathScreenshot;
      }
    } catch {
      // Nothing to do
    }

    return '';
  }

  async getScreenshotsLogEntry(
    isFullpage: boolean,
    isScreenshot: boolean,
    element: Element,
    fullpageName?: string,
    screenshotName?: string,
  ): Promise<string[]> {
    const fullPageScreenshot = isFullpage ? await this.saveScreenshotFull(fullpageName) : [];
    const elementsScreenshots = isScreenshot ? await this.saveScreenshotElement(element, screenshotName) : [];
    const screenshots = [fullPageScreenshot, elementsScreenshots].flat().filter((v) => Boolean(v));
    return screenshots;
  }
}
