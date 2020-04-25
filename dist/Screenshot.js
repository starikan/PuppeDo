var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const dayjs = require('dayjs');
const { sleep } = require('./Helpers.js');
const Environment = require('./Environment.js');
class Screenshot {
    constructor({ envsId } = {}) {
        const { socket, envs } = Environment({ envsId });
        this.envs = envs;
        this.socket = socket;
    }
    getScreenshots(element, fullPage = false, extendInfo = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (extendInfo) {
                return [];
            }
            const elementScreenshot = yield this.saveScreenshot({ element });
            const fullPageScreenshot = yield this.saveScreenshot({ fullPage });
            const screenshotsExists = [elementScreenshot, fullPageScreenshot].filter((v) => v);
            return screenshotsExists;
        });
    }
    copyScreenshotToLatest(name) {
        const { folder, folderLatest } = this.envs.getOutputsFolders();
        const pathScreenshot = path.join(folder, name);
        const pathScreenshotLatest = path.join(folderLatest, name);
        fs.copyFileSync(pathScreenshot, pathScreenshotLatest);
    }
    saveScreenshot({ fullPage = false, element = false } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { folder } = this.envs.getOutputsFolders();
            try {
                const name = `${dayjs().format('YYYY-MM-DD_HH-mm-ss.SSS')}.png`;
                const pathScreenshot = path.resolve(path.join(folder, name));
                if (fullPage) {
                    const page = this.envs.getActivePage();
                    yield page.screenshot({ path: pathScreenshot, fullPage });
                }
                if (element && _.isObject(element) && !_.isEmpty(element)) {
                    yield element.screenshot({ path: pathScreenshot });
                }
                if (fs.existsSync(pathScreenshot)) {
                    this.copyScreenshotToLatest(name);
                    yield sleep(25);
                    return pathScreenshot;
                }
                return false;
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.log('Can not create a screenshot');
                return false;
            }
        });
    }
}
module.exports = { Screenshot };
//# sourceMappingURL=Screenshot.js.map