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

const LEVELS: ColorsType[] = ['raw', 'timer', 'debug', 'info', 'test', 'warn', 'error', 'env'];

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

  static checkLevel(level: ColorsType): boolean {
    const { PPD_LOG_LEVEL_TYPE_IGNORE } = new Arguments().args;
    return !(PPD_LOG_LEVEL_TYPE_IGNORE.includes(level) || !LEVELS.includes(level));
  }

  static isManualSkipEntry(level: ColorsType, logThis: boolean, logShowFlag: boolean, levelIndent: number): boolean {
    const { PPD_LOG_DISABLED, PPD_LOG_LEVEL_NESTED } = new Arguments().args;
    const manualSkipEntry =
      !Log.checkLevel(level) ||
      !logThis ||
      (level !== 'error' && !logShowFlag) ||
      (level !== 'error' && PPD_LOG_LEVEL_NESTED && levelIndent > PPD_LOG_LEVEL_NESTED) || // SKIP LOG BY LEVELS
      (level !== 'error' && PPD_LOG_DISABLED); // NO LOG FILES ONLY STDOUT
    return manualSkipEntry;
  }

  async getScreenshots(
    logOptions: LogOptionsType,
    level: ColorsType,
    levelIndent: number,
    extendInfo: boolean,
    element: Element,
  ): Promise<string[]> {
    const { PPD_LOG_SCREENSHOT, PPD_LOG_FULLPAGE } = new Arguments().args;
    const { screenshot = false, fullpage = false, fullpageName, screenshotName } = logOptions;

    if (!Log.checkLevel(level)) {
      return [];
    }

    // TODO: 2020-02-05 S.Starodubov get values from env.yaml
    let isScreenshot = PPD_LOG_SCREENSHOT ? screenshot : false;
    let isFullpage = PPD_LOG_FULLPAGE ? fullpage : false;

    // SCREENSHOT ON ERROR ONLY ONES
    if (level === 'error' && levelIndent === 0) {
      [isScreenshot, isFullpage] = [true, true];
    }

    const screenshots = await new Screenshot(this.envsId).getScreenshotsLogEntry(
      isFullpage && !extendInfo,
      isScreenshot && !extendInfo,
      element,
      fullpageName,
      screenshotName,
    );

    return screenshots;
  }

  async bulkLog(data: LogInputType[]): Promise<void> {
    for (const entry of data) {
      await this.log(entry);
    }
  }

  async runPipes(logEntries: LogEntry[], skipThis = false): Promise<void> {
    const { log } = new Environment().getEnvAllInstance(this.envsId);
    for (const logEntry of logEntries) {
      for (const pipe of this.pipes) {
        try {
          const transformedEntry = await pipe.transformer(logEntry);
          const formatedEntry = await pipe.formatter(logEntry, transformedEntry);
          await pipe.exporter(logEntry, formatedEntry as LogEntrieType[][], formatedEntry as string, {
            envsId: this.envsId,
            skipThis,
            fullLog: log,
          });
        } catch (e) {
          console.log(`Error in logger pipe: ${e.message}`);
        }
      }
    }
  }

  async log({
    text = '',
    level = 'raw',
    levelIndent = 0,
    element,
    error = null,
    stdOut = this.options.stdOut !== undefined ? this.options.stdOut : true,
    stepId = '',
    logOptions = {},
    extendInfo = false,
  }: LogInputType): Promise<void> {
    const texts = [text].flat();
    const {
      textColor = 'sane',
      backgroundColor = 'sane',
      logThis = true,
      funcFile = '',
      testFile = '',
      logShowFlag = true,
    } = logOptions;
    const manualSkipEntry = Log.isManualSkipEntry(level, logThis, logShowFlag, levelIndent);
    const screenshots = await this.getScreenshots(logOptions, level, levelIndent, extendInfo, element);

    try {
      const logEntries = texts.map((textString) => {
        const logEntry: LogEntry = {
          text: textString,
          level: level ?? ('raw' as ColorsType),
          levelIndent,
          time: new Date(),
          screenshots,
          funcFile,
          testFile,
          extendInfo,
          error,
          textColor,
          backgroundColor: level === 'error' ? 'sane' : backgroundColor,
          stepId: this.options.testArgs?.stepId || stepId,
          breadcrumbs: this.options?.breadcrumbs || [],
          repeat: this.options?.testArgs?.repeat || 1,
        };
        return logEntry;
      });

      await this.runPipes(logEntries, !stdOut || manualSkipEntry);
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
