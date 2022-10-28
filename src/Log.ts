import path from 'path';

import { Arguments } from './Arguments';
import Screenshot from './Screenshot';

import { ColorsType, LogEntrieType, LogEntry, LogFunctionType, LogInputType, LogPipe, TestArgsType } from './global.d';
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

  // console.log(args);
};

type LogOptions = {
  breadcrumbs?: Array<string>;
  testArgs?: TestArgsType;
  stdOut?: boolean;
};

export default class Log {
  envsId: string;

  options: LogOptions;

  private pipes: LogPipe[];

  constructor(envsId: string, loggerOptions: { stdOut?: boolean } = {}) {
    const { stdOut } = loggerOptions;

    this.envsId = envsId;
    this.options = { stdOut };
    this.pipes = [];
  }

  bindData(data: LogOptions = {}): void {
    this.options = { ...this.options, ...data };
  }

  addLogPipe(pipe: LogPipe): void {
    this.pipes.push(pipe);
  }

  static checkLevel(level: string): ColorsType | null {
    const LEVELS: ColorsType[] = ['raw', 'timer', 'debug', 'info', 'test', 'warn', 'error', 'env'];
    const { PPD_LOG_LEVEL_TYPE_IGNORE } = new Arguments().args;

    if (level === 'error') {
      return 'error' as ColorsType;
    }

    if (PPD_LOG_LEVEL_TYPE_IGNORE.includes(level as ColorsType) || !LEVELS.includes(level as ColorsType)) {
      return null;
    }

    return level as ColorsType;
  }

  static isManualSkipEntry(levelText, logThis, logShowFlag, levelIndent): boolean {
    const { PPD_LOG_DISABLED, PPD_LOG_LEVEL_NESTED } = new Arguments().args;
    const manualSkipEntry =
      !levelText ||
      !logThis ||
      (levelText !== 'error' && !logShowFlag) ||
      (levelText !== 'error' && PPD_LOG_LEVEL_NESTED && levelIndent > PPD_LOG_LEVEL_NESTED) || // SKIP LOG BY LEVELS
      (levelText !== 'error' && PPD_LOG_DISABLED); // NO LOG FILES ONLY STDOUT
    return manualSkipEntry;
  }

  async getScreenshots(logOptions, levelText, levelIndent, extendInfo, element): Promise<string[]> {
    const { PPD_LOG_SCREENSHOT, PPD_LOG_FULLPAGE } = new Arguments().args;
    const { screenshot = false, fullpage = false, fullpageName, screenshotName } = logOptions;

    // TODO: 2020-02-05 S.Starodubov get values from env.yaml
    let isScreenshot = PPD_LOG_SCREENSHOT ? screenshot : false;
    let isFullpage = PPD_LOG_FULLPAGE ? fullpage : false;

    // SCREENSHOT ON ERROR ONLY ONES
    if (levelText === 'error' && levelIndent === 0) {
      [isScreenshot, isFullpage] = [true, true];
    }

    const screenshots = await new Screenshot(this.envsId).getScreenshotsLogEntry(
      isFullpage && !extendInfo,
      isScreenshot && !extendInfo,
      fullpageName,
      element,
      screenshotName,
    );

    return screenshots;
  }

  async log({
    text = '',
    level = 'info',
    levelIndent = 0,
    element,
    error = null,
    extendInfo = false,
    stdOut = this.options.stdOut !== undefined ? this.options.stdOut : true,
    stepId = '',
    logShowFlag = true,
    funcFile = '',
    testFile = '',
    logOptions = {},
  }: LogInputType): Promise<void> {
    const texts = [text].flat();
    const levelText = Log.checkLevel(level);
    const { log } = new Environment().getEnvAllInstance(this.envsId);
    const { textColor = 'sane', backgroundColor = 'sane', logThis = true } = logOptions;
    const manualSkipEntry = Log.isManualSkipEntry(levelText, logThis, logShowFlag, levelIndent);
    const screenshots = await this.getScreenshots(logOptions, levelText, levelIndent, extendInfo, element);

    try {
      const logEntries = texts.map((textString) => {
        const logEntry: LogEntry = {
          text: textString,
          level: levelText,
          levelIndent,
          time: new Date(),
          screenshots,
          stepId: this.options.testArgs?.stepId || stepId,
          funcFile,
          testFile,
          extendInfo,
          error,
          textColor,
          backgroundColor: levelText === 'error' ? 'sane' : backgroundColor,
          breadcrumbs: this.options?.breadcrumbs || [],
          repeat: this.options?.testArgs?.repeat || 1,
        };
        return logEntry;
      });

      for (const logEntry of logEntries) {
        for (const pipe of this.pipes) {
          try {
            const transformedEntry = await pipe.transformer(logEntry);
            const formatedEntry = await pipe.formatter(logEntry, transformedEntry);
            await pipe.exporter(logEntry, formatedEntry as LogEntrieType[][], formatedEntry as string, {
              envsId: this.envsId,
              skipThis: !stdOut || manualSkipEntry,
              fullLog: log,
            });
          } catch (e) {
            console.log(`Error in logger pipe: ${e.message}`);
          }
        }
      }
    } catch (err) {
      const { PPD_DEBUG_MODE } = new Arguments().args;
      const socket = new Environment().getSocket(this.envsId);

      err.message += ' || error in log';
      err.socket = socket;
      err.debug = PPD_DEBUG_MODE;
      err.stepId = this.options.testArgs?.stepId;
      throw err;
    }
  }
}
