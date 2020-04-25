"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deepmerge_1 = __importDefault(require("deepmerge"));
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
exports.sleep = sleep;
exports.merge = (...objects) => deepmerge_1.default.all(objects, { arrayMerge: (destArray, sourceArray) => sourceArray });
/*
https://stackoverflow.com/questions/23975735/what-is-this-u001b9-syntax-of-choosing-what-color-text-appears-on-console

SANE = "\u001B[0m"

HIGH_INTENSITY = "\u001B[1m"
LOW_INTENSITY = "\u001B[2m"

ITALIC = "\u001B[3m"
UNDERLINE = "\u001B[4m"
BLINK = "\u001B[5m"
RAPID_BLINK = "\u001B[6m"
REVERSE_VIDEO = "\u001B[7m"
INVISIBLE_TEXT = "\u001B[8m"

BACKGROUND_BLACK = "\u001B[40m"
BACKGROUND_RED = "\u001B[41m"
BACKGROUND_GREEN = "\u001B[42m"
BACKGROUND_YELLOW = "\u001B[43m"
BACKGROUND_BLUE = "\u001B[44m"
BACKGROUND_MAGENTA = "\u001B[45m"
BACKGROUND_CYAN = "\u001B[46m"
BACKGROUND_WHITE = "\u001B[47m"
*/
exports.paintString = (str, color = 'sane') => {
    const colors = {
        sane: 0,
        black: 30,
        red: 31,
        green: 32,
        yellow: 33,
        blue: 34,
        magenta: 35,
        cyan: 36,
        white: 37,
    };
    colors.raw = colors.sane;
    colors.timer = colors.sane;
    colors.debug = colors.sane;
    colors.info = colors.cyan;
    colors.test = colors.green;
    colors.warn = colors.yellow;
    colors.error = colors.red;
    colors.trace = colors.cyan;
    colors.env = colors.blue;
    return `\u001b[${colors[color] || 0}m${str}\u001b[0m`;
};
exports.blankSocket = {
    send: () => { },
    sendYAML: () => { },
};
//# sourceMappingURL=Helpers.js.map