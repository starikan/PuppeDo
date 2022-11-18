import { Arguments } from './Arguments';
import Screenshot from './Screenshot';

import {
  ColorsType,
  Element,
  LogEntrieType,
  LogEntry,
  LogInputType,
  LogOptionsType,
  LogPipe,
  TestArgsType,
} from './global.d';
import { Environment } from './Environment';

type LogOptions = {
  breadcrumbs?: Array<string>;
  testArgs?: TestArgsType;
  stdOut?: boolean;
};

export default class Log {
  private envsId: string;

  private options: LogOptions;

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

  static isManualSkipEntry(
    levelText: ColorsType,
    logThis: boolean,
    logShowFlag: boolean,
    levelIndent: number,
  ): boolean {
    const { PPD_LOG_DISABLED, PPD_LOG_LEVEL_NESTED } = new Arguments().args;
    const manualSkipEntry =
      !levelText ||
      !logThis ||
      (levelText !== 'error' && !logShowFlag) ||
      (levelText !== 'error' && PPD_LOG_LEVEL_NESTED && levelIndent > PPD_LOG_LEVEL_NESTED) || // SKIP LOG BY LEVELS
      (levelText !== 'error' && PPD_LOG_DISABLED); // NO LOG FILES ONLY STDOUT
    return manualSkipEntry;
  }

  async getScreenshots(
    logOptions: LogOptionsType,
    levelText: ColorsType,
    levelIndent: number,
    extendInfo: boolean,
    element: Element,
  ): Promise<string[]> {
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
      screenshotName,
      element,
    );

    return screenshots;
  }

  async bulkLog(data: LogInputType[]): Promise<void> {
    for (const entry of data) {
      await this.log(entry);
    }
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
