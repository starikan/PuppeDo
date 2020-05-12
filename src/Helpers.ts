import deepmerge from 'deepmerge';

type ColorsMainType = {
  sane: number;
  black: number;
  red: number;
  green: number;
  yellow: number;
  blue: number;
  magenta: number;
  cyan: number;
  white: number;
};

type ColorsExtendType = {
  raw: number;
  timer: number;
  debug: number;
  info: number;
  test: number;
  warn: number;
  error: number;
  trace: number;
  env: number;
};

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const merge = (...objects) => deepmerge.all(objects, { arrayMerge: (dest, source) => source });

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

export const paintString = (str: string, color: string = 'sane'): string => {
  const mainColors: ColorsMainType = {
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

  const extendColors: ColorsExtendType = {
    raw: mainColors.sane,
    timer: mainColors.sane,
    debug: mainColors.sane,
    info: mainColors.cyan,
    test: mainColors.green,
    warn: mainColors.yellow,
    error: mainColors.red,
    trace: mainColors.cyan,
    env: mainColors.blue,
  };

  return `\u001b[${{ ...mainColors, ...extendColors }[color] || 0}m${str}\u001b[0m`;
};

export const blankSocket: SocketType = {
  send: () => {},
  sendYAML: () => {},
};

export const getTimer = (timeStart: bigint): string => (Number(process.hrtime.bigint() - timeStart) / 1e9).toFixed(3);
