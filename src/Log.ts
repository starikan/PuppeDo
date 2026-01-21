import fs from 'fs';
import path from 'path';
import { Arguments } from './Arguments';
import { Environment } from './Environment';
import { getNowDateTime } from './Helpers';
import type {
  ColorsType,
  Element,
  LogEntrieType,
  LogEntry,
  LogInputType,
  LogOptionsType,
  LogPipe,
  Outputs,
  TreeEntryDataType,
} from './model';
import Screenshot from './Screenshot';
import Singleton from './Singleton';

const LEVELS: ColorsType[] = ['raw', 'timer', 'debug', 'info', 'test', 'warn', 'error', 'env'];

export class LogExports {
  envsId!: string;

  constructor(envsId: string) {
    this.envsId = envsId;
  }

  saveToFile(fileName: string, text: string): void {
    const { folderLatest, folder } = new Environment().getOutput(this.envsId);
    fs.writeFileSync(path.join(folder, fileName), text);
    fs.writeFileSync(path.join(folderLatest, fileName), text);
  }

  appendToFile(fileName: string, text: string): void {
    const { folderLatest, folder } = new Environment().getOutput(this.envsId);
    fs.appendFileSync(path.join(folder, fileName), text);
    fs.appendFileSync(path.join(folderLatest, fileName), text);
  }

  static resolveOutputHtmlFile(): string {
    const outputSourceRaw = path.resolve(path.join('dist', 'output.html'));
    const outputSourceModule = path.resolve(
      path.join(__dirname, '..', 'node_modules', '@puppedo', 'core', 'dist', 'output.html'),
    );
    const outputSource = fs.existsSync(outputSourceRaw) ? outputSourceRaw : outputSourceModule;
    return outputSource;
  }

  static initOutput(envsId: string): Outputs {
    const { PPD_OUTPUT: output } = new Arguments().args;

    const now = getNowDateTime();

    if (!fs.existsSync(output)) {
      fs.mkdirSync(output);
    }

    const folder = path.join(output, `${now}_${envsId}`);
    const folderLatest = path.join(output, 'latest');

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }

    // Create latest log path
    if (!fs.existsSync(folderLatest)) {
      fs.mkdirSync(folderLatest);
    } else {
      const filesExists = fs.readdirSync(folderLatest);
      for (const fileExists of filesExists) {
        fs.unlinkSync(path.join(folderLatest, fileExists));
      }
    }

    try {
      fs.copyFileSync(LogExports.resolveOutputHtmlFile(), path.join(folderLatest, 'output.html'));
      fs.copyFileSync(LogExports.resolveOutputHtmlFile(), path.join(folder, 'output.html'));
    } catch {
      // Handle error if needed
    }

    return {
      output,
      name: envsId,
      folder,
      folderFull: path.resolve(folder),
      folderLatest,
      folderLatestFull: path.resolve(folderLatest),
    };
  }
}

type LogOptionsOptionsType = { stdOut?: boolean; loggerPipes?: LogPipe[] };

export class LogOptions extends Singleton {
  options!: LogOptionsOptionsType;

  constructor(options: LogOptionsOptionsType = {}, reInit = false) {
    super();
    if (reInit || !this.options) {
      this.options = options;

      if (!this.options.loggerPipes) {
        this.options.loggerPipes = [];
      }
    }
  }

  bindOptions(data: { stdOut?: boolean; loggerPipes?: LogPipe[] } = {}): void {
    this.options = { ...this.options, ...data };
  }

  addLogPipe(pipe: LogPipe): void {
    this.options.loggerPipes.push(pipe);
  }
}

export class Log {
  private envsId: string;

  exporter!: LogExports;

  output!: Outputs;

  constructor(envsId: string) {
    this.envsId = envsId;
    this.output = LogExports.initOutput(envsId);
    this.exporter = new LogExports(envsId);
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

  async runPipes(logEntries: LogEntry[], manualSkipEntry = false): Promise<void> {
    const { loggerPipes, stdOut = true } = new LogOptions().options;
    for (const logEntry of logEntries) {
      for (const pipe of loggerPipes) {
        try {
          const transformedEntry = await pipe.transformer(logEntry);
          const formatedEntry = await pipe.formatter(logEntry, transformedEntry);
          await pipe.exporter(logEntry, formatedEntry as LogEntrieType[][], formatedEntry as string, {
            envsId: this.envsId,
            skipThis: !stdOut || manualSkipEntry,
          });
        } catch (e) {
          console.log(`Error in logger pipe: ${e.message}`);
        }
      }
    }
  }

  private updateTree(logEntries: LogEntry[]): void {
    const { testTree } = new Environment().getEnvInstance(this.envsId);
    for (const logEntry of logEntries) {
      const payload: Partial<TreeEntryDataType> = {};
      if (logEntry.level === 'timer') {
        payload.timeStart = logEntry.logMeta?.timeStart;
        payload.timeEnd = logEntry.logMeta?.timeEnd;
      }
      testTree.updateStep({ stepId: logEntry.stepId, payload });
    }
  }

  async log({
    text = '',
    level = 'raw',
    levelIndent = 0,
    element,
    error = null,
    stepId = '',
    logMeta = {},
    logOptions = {},
  }: LogInputType): Promise<void> {
    const texts = [text].flat();
    const { textColor = 'sane', backgroundColor = 'sane', logThis = true, logShowFlag = true } = logOptions;
    const { funcFile = '', testFile = '', extendInfo = false } = logMeta;
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
          stepId,
          breadcrumbs: logMeta.breadcrumbs ?? [],
          repeat: logMeta.repeat ?? 1,
          logMeta,
        };
        return logEntry;
      });

      this.updateTree(logEntries);
      await this.runPipes(logEntries, manualSkipEntry);
    } catch (err) {
      const { PPD_DEBUG_MODE } = new Arguments().args;
      const socket = new Environment().getSocket(this.envsId);

      err.message += ' || error in log';
      err.socket = socket;
      err.debug = PPD_DEBUG_MODE;
      err.stepId = stepId ?? '';
      throw err;
    }
  }
}
