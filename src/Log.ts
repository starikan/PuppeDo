import path from 'path';
import fs from 'fs';

import yaml from 'js-yaml';

import { paintString, colors, getNowDateTime } from './Helpers';
import { Arguments } from './Arguments';
import Screenshot from './Screenshot';

import { ColorsType, LogEntrieType, LogEntry, LogFunctionType, LogInputType, TestArgsType } from './global.d';
import { ErrorType } from './Error';
import { Environment } from './Environment';

export const logExtendFileInfo = async (log: LogFunctionType, levelIndent: number, envsId = ''): Promise<void> => {
  if (envsId) {
    const output = new Environment().getOutput(envsId);
    const outputFile = path.join(output.folderFull || '.', 'output.log');
    const text = ['=============== EXTEND FILE ===============', `file:///${outputFile}`, ''];
    await log({ text, levelIndent, level: 'error', extendInfo: true });
  }
};

export const logErrorMessage = async (log: LogFunctionType, levelIndent: number, error: ErrorType): Promise<void> => {
  if (error.message) {
    const text = ['============== ERROR MESSAGE ==============', ...error.message.split('\n'), ''];
    await log({ text, levelIndent, level: 'error', extendInfo: true });
  }
};

export const logStack = async (
  log: LogFunctionType,
  levelIndent: number,
  error: ErrorType,
  stdOut = false,
): Promise<void> => {
  if (error.stack) {
    const text = ['============== ERROR STACK ==============', ...error.stack.split('\n'), ''];
    await log({ text, levelIndent, level: 'error', extendInfo: true, stdOut });
  }
};

export const logTimer = async (log: LogFunctionType, startTime: bigint, levelIndent = 0): Promise<void> => {
  const { PPD_LOG_EXTEND } = new Arguments().args;
  if (PPD_LOG_EXTEND) {
    const text = `⌛: ${(Number(process.hrtime.bigint() - startTime) / 1e9).toFixed(3)} s.`;
    await log({ text, level: 'timer', levelIndent: levelIndent + 1, extendInfo: true });
  }
};

export const logExtend = async (
  log: LogFunctionType,
  levelIndent: number,
  args: TestArgsType | undefined,
  isError = false,
): Promise<void> => {
  const { PPD_LOG_EXTEND } = new Arguments().args;
  const { dataTest, bindData, selectorsTest, bindSelectors, bindResults, options } = args || {};
  if (PPD_LOG_EXTEND || isError) {
    let text = [
      ['📋 (data):', dataTest],
      ['📌📋 (bD):', bindData],
      ['☸️ (selectors):', selectorsTest],
      ['📌☸️ (bS):', bindSelectors],
      ['↩️ (results):', bindResults],
      ['⚙️ (options):', options],
    ]
      .filter((v) => typeof v[1] === 'object' && Object.keys(v[1]).length)
      .map((v) => `${v[0]} ${JSON.stringify(v[1])}`);

    if (isError && text.length) {
      text = ['============== ALL DATA ==============', ...text, ''];
    }

    await log({
      text,
      levelIndent: isError ? levelIndent : levelIndent + 1,
      level: isError ? 'error' : 'info',
      extendInfo: true,
    });
  }
};

export const logArgs = async (log: LogFunctionType, levelIndent: number, stdOut = false): Promise<void> => {
  const args = Object.entries(new Arguments().args).map((v) => `${v[0]}: ${JSON.stringify(v[1])}`);
  const text = ['============== ARGUMENTS ==============', ...args, ''];
  await log({ text, levelIndent, level: 'error', extendInfo: true, stdOut });
};

export const logDebug = async (
  log: LogFunctionType,
  levelIndent: number,
  args: TestArgsType | undefined,
  stdOut = false,
  type: 'data' | 'selectors' | boolean = true,
): Promise<void> => {
  let text: string[] = [];
  const { data, selectors } = args || {};
  if (data && Object.keys(data).length && (type === true || type === 'data')) {
    const dataDebug = JSON.stringify(data, null, 2).split('\n');
    text = [...text, '============== DEBUG DATA ==============', ...dataDebug, ''];
  }
  if (selectors && Object.keys(selectors).length && (type === true || type === 'selectors')) {
    const selectorsDebug = JSON.stringify(selectors, null, 2).split('\n');
    text = [...text, '============== DEBUG SELECTORS ==============', ...selectorsDebug, ''];
  }

  await log({ text, levelIndent, level: 'error', extendInfo: true, stdOut });

  console.log(args);
};

export const checkLevel = (level: string): ColorsType | null => {
  const LEVELS: ColorsType[] = ['raw', 'timer', 'debug', 'info', 'test', 'warn', 'error', 'env'];
  const { PPD_LOG_LEVEL_TYPE_IGNORE } = new Arguments().args;

  if (level === 'error') {
    return 'error' as ColorsType;
  }

  if (PPD_LOG_LEVEL_TYPE_IGNORE.includes(level as ColorsType) || !LEVELS.includes(level as ColorsType)) {
    return null;
  }

  return level as ColorsType;
};

type LogOptions = {
  breadcrumbs?: Array<string>;
  testArgs?: TestArgsType;
  stdOut?: boolean;
};

export const makeLog = ({
  level = 'sane',
  levelIndent = 0,
  text = '',
  now = new Date(),
  funcFile = '',
  testFile = '',
  extendInfo = false,
  screenshots = [],
  error = null,
  textColor = 'sane',
  backgroundColor = 'sane',
  breadcrumbs = [],
  repeat = 1,
}: {
  level: ColorsType;
  levelIndent: number;
  text: string;
  now: Date;
  funcFile?: string;
  testFile?: string;
  extendInfo?: boolean;
  screenshots?: string[];
  error?: Error | ErrorType | null;
  textColor?: ColorsType;
  backgroundColor?: ColorsType;
  breadcrumbs?: string[];
  repeat?: number;
}): LogEntrieType[][] => {
  const errorTyped = error;
  const { PPD_LOG_EXTEND, PPD_LOG_TIMESTAMP_SHOW, PPD_LOG_INDENT_LENGTH } = new Arguments().args;

  const indentString = `|${' '.repeat(PPD_LOG_INDENT_LENGTH - 1)}`.repeat(levelIndent);
  const nowWithPad = PPD_LOG_TIMESTAMP_SHOW ? `${getNowDateTime(now, 'HH:mm:ss.SSS')} - ${level.padEnd(5)}  ` : '';
  const spacesPreffix = nowWithPad ? ' '.repeat(nowWithPad.length) : '';
  const headColor: ColorsType = level === 'error' ? 'error' : 'sane';
  const tailColor: ColorsType = level === 'error' ? 'error' : 'info';

  let backColor =
    backgroundColor && colors[backgroundColor] >= 30 && colors[backgroundColor] < 38
      ? (colors[colors[backgroundColor] + 10] as ColorsType)
      : backgroundColor;

  if (!Object.keys(colors).includes(backColor)) {
    backColor = 'sane';
  }

  const head: LogEntrieType = {
    text: `${extendInfo && level !== 'error' ? spacesPreffix : nowWithPad}${indentString}`,
    textColor: headColor,
  };
  const tail: LogEntrieType = {
    text,
    textColor: textColor !== 'sane' ? textColor : level,
  };
  if (backColor !== 'sane') {
    tail.backgroundColor = backColor;
  }

  const stringsLog: LogEntrieType[][] = [[head, tail]];

  if (breadcrumbs && breadcrumbs.length && level !== 'raw' && PPD_LOG_EXTEND && level !== 'error' && !extendInfo) {
    const headText = `${spacesPreffix}${indentString} `;
    const tailText = `👣[${breadcrumbs.join(' -> ')}]`;
    stringsLog.push([
      { text: headText, textColor: headColor },
      { text: tailText, textColor: tailColor },
    ]);

    if (repeat > 1) {
      stringsLog.push([
        { text: headText, textColor: headColor },
        { text: `🔆 repeats left: ${repeat - 1}`, textColor: tailColor },
      ]);
    }
  }

  if (level === 'error' && !extendInfo) {
    breadcrumbs.forEach((v, i) => {
      stringsLog.push([{ text: `${nowWithPad}${indentString}${'   '.repeat(i)} ${v}`, textColor: 'error' }]);
    });
    if (testFile) {
      stringsLog.push([
        {
          text: `${nowWithPad}${indentString} (file:///${path.resolve(testFile)})`,
          textColor: 'error',
        },
      ]);
    }
    if (funcFile) {
      stringsLog.push([
        {
          text: `${nowWithPad}${indentString} (file:///${path.resolve(funcFile)})`,
          textColor: 'error',
        },
      ]);
    }
  }

  (screenshots || []).forEach((v) => {
    stringsLog.push([
      { text: `${nowWithPad}${indentString} `, textColor: headColor },
      { text: `🖼 screenshot: [${v}]`, textColor: tailColor },
    ]);
  });

  if (level === 'error' && !extendInfo) {
    stringsLog.push([
      { text: `${nowWithPad}${indentString} `, textColor: headColor },
      { text: '='.repeat(120 - (levelIndent + 1) * 3 - 21), textColor: tailColor },
    ]);
  }

  if (level === 'error' && !extendInfo && levelIndent === 0) {
    const message = (errorTyped?.message || '').split(' || ');
    const stack = (errorTyped?.stack || '').split('\n    ');

    [...message, '='.repeat(120 - (levelIndent + 1) * 3 - 21), ...stack].forEach((v) => {
      stringsLog.push([
        { text: ' '.repeat(22), textColor: 'error' },
        { text: v, textColor: 'error' },
      ]);
    });
  }

  return stringsLog;
};

export const consoleLog = (entries: LogEntrieType[][]): void => {
  entries.forEach((entry) => {
    const line = entry
      .map((part) => {
        let text = paintString(part.text, part.textColor);
        if (part.backgroundColor && part.backgroundColor !== 'sane') {
          text = paintString(text, part.backgroundColor);
        }
        return text;
      })
      .join('');
    console.log(line);
  });
};

export const fileLog = (envsId: string, texts: string | LogEntrieType[][] = [], fileName = 'output.log'): void => {
  const { folderLatest = '.', folder = '.' } = new Environment().getOutput(envsId);

  let textsJoin = '';
  if (Array.isArray(texts)) {
    textsJoin = texts.map((text) => text.map((log) => log.text || '').join('')).join('\n');
  } else {
    textsJoin = texts.toString();
  }

  // eslint-disable-next-line no-control-regex
  textsJoin = textsJoin.replace(/\[\d+m/gi, '');

  fs.appendFileSync(path.join(folder, fileName), `${textsJoin}\n`);
  fs.appendFileSync(path.join(folderLatest, fileName), `${textsJoin}\n`);
};

export default class Log {
  envsId: string;

  screenshot: Screenshot;

  options: LogOptions;

  constructor(envsId: string, loggerOptions: { stdOut?: boolean } = {}) {
    const { stdOut } = loggerOptions;

    this.envsId = envsId;
    this.options = { stdOut };
    this.screenshot = new Screenshot(envsId);
  }

  bindData(data: LogOptions = {}): void {
    this.options = { ...this.options, ...data };
  }

  async log({
    funcFile = '',
    testFile = '',
    text = '',
    screenshot = false,
    fullpage = false,
    screenshotName,
    fullpageName,
    level = 'info',
    element,
    levelIndent = 0,
    error = null,
    extendInfo = false,
    stdOut = this.options.stdOut !== undefined ? this.options.stdOut : true,
    stepId = '',
    logShowFlag = true,
    textColor = 'sane',
    backgroundColor = 'sane',
  }: LogInputType): Promise<void> {
    const { PPD_LOG_DISABLED, PPD_LOG_LEVEL_NESTED, PPD_LOG_SCREENSHOT, PPD_LOG_FULLPAGE } = new Arguments().args;
    const texts = [text].flat();
    const levelText = checkLevel(level);

    if (
      !levelText ||
      (levelText !== 'error' && !logShowFlag) ||
      (levelText !== 'error' && PPD_LOG_LEVEL_NESTED && levelIndent > PPD_LOG_LEVEL_NESTED) || // SKIP LOG BY LEVELS
      (levelText !== 'error' && PPD_LOG_DISABLED) // NO LOG FILES ONLY STDOUT
    ) {
      return;
    }

    const socket = new Environment().getSocket(this.envsId);
    const { log } = new Environment().getEnvAllInstance(this.envsId);

    try {
      // SCREENSHOT ON ERROR ONLY ONES
      // TODO: 2020-02-05 S.Starodubov get values from env.yaml
      let isScreenshot = PPD_LOG_SCREENSHOT ? screenshot : false;
      let isFullpage = PPD_LOG_FULLPAGE ? fullpage : false;

      if (levelText === 'error' && levelIndent === 0) {
        [isScreenshot, isFullpage] = [true, true];
      }

      const fullPageScreenshot =
        isFullpage && !extendInfo ? await this.screenshot.saveScreenshotFull(fullpageName) : [];
      const elementsScreenshots =
        isScreenshot && !extendInfo ? await this.screenshot.saveScreenshotElement(element, screenshotName) : [];
      const screenshots = [fullPageScreenshot, elementsScreenshots].flat().filter((v) => !!v);

      const now = new Date();
      texts.forEach((textString) => {
        const logTexts = makeLog({
          level: levelText,
          levelIndent,
          text: textString,
          now,
          funcFile,
          testFile,
          extendInfo,
          screenshots,
          error,
          textColor,
          backgroundColor: levelText === 'error' ? 'sane' : backgroundColor,
          breadcrumbs: this.options?.breadcrumbs || [],
          repeat: this.options?.testArgs?.repeat || 1,
        });

        // STDOUT
        if (stdOut) {
          consoleLog(logTexts);
        }

        // EXPORT TEXT LOG
        fileLog(this.envsId, logTexts, 'output.log');

        const logEntry: LogEntry = {
          text: textString,
          time: getNowDateTime(now),
          screenshots,
          type: level === 'env' ? 'env' : 'log',
          level,
          levelIndent,
          stepId: this.options.testArgs?.stepId || stepId,
        };

        log.push(logEntry);
        socket.sendYAML({ type: 'log', data: logEntry, envsId: this.envsId });

        // Export YAML log every step
        const yamlString = `-\n${yaml.dump(logEntry, { lineWidth: 1000, indent: 2 }).replace(/^/gm, ' '.repeat(2))}`;
        fileLog(this.envsId, yamlString, 'output.yaml');
      });
    } catch (err) {
      const { PPD_DEBUG_MODE } = new Arguments().args;

      err.message += ' || error in log';
      err.socket = socket;
      err.debug = PPD_DEBUG_MODE;
      err.stepId = this.options.testArgs?.stepId;
      throw err;
    }
  }
}
