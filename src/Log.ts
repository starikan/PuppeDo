import path from 'path';
import fs from 'fs';

import yaml from 'js-yaml';

import { paintString, colors, getNowDateTime } from './Helpers';
import { Arguments } from './Arguments';
import Screenshot from './Screenshot';

import {
  ColorsType,
  EnvsPoolType,
  LogEntrieType,
  LogEntry,
  LogFunctionType,
  LogInputType,
  SocketType,
  TestArgsExtType,
} from './global.d';
import { ErrorType } from './Error';
import Environment from './Environment';

export const logExtendFileInfo = async (log: LogFunctionType, levelIndent: number, envsId: string): Promise<void> => {
  const envs = Environment(envsId);
  const outputFile = path.join(envs.envsPool.output.folderFull, 'output.log');
  const text = ['=============== EXTEND FILE ===============', `file:///${outputFile}`, ''];
  await log({ text, levelIndent, level: 'error', extendInfo: true });
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

export const logTimer = async (log: LogFunctionType, levelIndent = 0, startTime: bigint): Promise<void> => {
  const { PPD_LOG_EXTEND } = new Arguments().args;
  if (PPD_LOG_EXTEND) {
    const text = `⌛: ${(Number(process.hrtime.bigint() - startTime) / 1e9).toFixed(3)} s.`;
    await log({ text, level: 'timer', levelIndent: levelIndent + 1, extendInfo: true });
  }
};

export const logExtend = async (
  log: LogFunctionType,
  levelIndent: number,
  args: TestArgsExtType,
  isError = false,
): Promise<void> => {
  const { PPD_LOG_EXTEND } = new Arguments().args;
  if (PPD_LOG_EXTEND || isError) {
    let text = [
      ['📋 (data):', args.dataTest],
      ['📌📋 (bD):', args.bindData],
      ['☸️ (selectors):', args.selectorsTest],
      ['📌☸️ (bS):', args.bindSelectors],
      ['↩️ (results):', args.bindResults],
      ['⚙️ (options):', args.options],
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
  args: TestArgsExtType,
  stdOut = false,
): Promise<void> => {
  let text = [];

  if (args.data && Object.keys(args.data).length) {
    const dataDebug = JSON.stringify(args.data, null, 2).split('\n');
    text = [...text, '============== DEBUG DATA ==============', ...dataDebug, ''];
  }
  if (args.selectors && Object.keys(args.selectors).length) {
    const selectorsDebug = JSON.stringify(args.selectors, null, 2).split('\n');
    text = [...text, '============== DEBUG SELECTORS ==============', ...selectorsDebug, ''];
  }

  await log({ text, levelIndent, level: 'error', extendInfo: true, stdOut });
};

export default class Log {
  envsId: string;
  envs: EnvsPoolType;
  socket: SocketType;
  binded: {
    testSource?: {
      breadcrumbs: Array<string>;
    };
    bindedData?: {
      repeat: number;
      stepId: string;
    };
  };
  screenshot: Screenshot;

  constructor(envsId: string, envsPool: EnvsPoolType, socket: SocketType) {
    this.envsId = envsId;
    this.envs = envsPool;
    this.socket = socket;
    this.binded = {};
    this.screenshot = new Screenshot(envsPool, socket);
  }

  bindData(data: Record<string, unknown> = {}): void {
    this.binded = { ...this.binded, ...data };
  }

  static checkLevel(level: number | string): ColorsType | null {
    enum levels {
      raw,
      timer,
      debug,
      info,
      test,
      warn,
      error,
      env,
    }

    const { PPD_LOG_LEVEL_TYPE, PPD_LOG_LEVEL_TYPE_IGNORE } = new Arguments().args;

    const inputLevel = typeof level === 'number' ? level : levels[level] || 0;
    const limitLevel = levels[PPD_LOG_LEVEL_TYPE] || 0;
    const ignoreLevels = PPD_LOG_LEVEL_TYPE_IGNORE.map((v: ColorsType) => levels[v]);

    if (ignoreLevels.includes(inputLevel)) {
      return null;
    }

    // If input level higher or equal then logging
    if (limitLevel <= inputLevel || levels[inputLevel] === 'error') {
      return levels[inputLevel] as ColorsType;
    }
    return null;
  }

  makeLog(
    level: ColorsType = 'sane',
    levelIndent = 0,
    text = '',
    now = new Date(),
    funcFile = '',
    testFile = '',
    extendInfo = false,
    screenshots = [],
    error: Error | ErrorType | null = null,
    textColor: ColorsType = 'sane',
    backgroundColor: ColorsType = 'sane',
  ): LogEntrieType[][] {
    const errorTyped = error;
    const { PPD_LOG_EXTEND } = new Arguments().args;

    const nowWithPad = `${getNowDateTime(now, 'HH:mm:ss.SSS')} - ${level.padEnd(5)}`;
    const breadcrumbs = this.binded?.testSource?.breadcrumbs || [];

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
      text: `${extendInfo && level !== 'error' ? ' '.repeat(20) : nowWithPad} ${' | '.repeat(levelIndent)} `,
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

    if (breadcrumbs.length && level !== 'raw' && PPD_LOG_EXTEND && level !== 'error' && !extendInfo) {
      const headText = `${' '.repeat(20)} ${' | '.repeat(levelIndent)} `;
      const tailText = `👣[${breadcrumbs.join(' -> ')}]`;
      stringsLog.push([
        { text: headText, textColor: headColor },
        { text: tailText, textColor: tailColor },
      ]);

      const repeat = this.binded?.bindedData?.repeat || 1;
      if (repeat > 1) {
        stringsLog.push([
          { text: headText, textColor: headColor },
          { text: `🔆 repeats left: ${repeat - 1}`, textColor: tailColor },
        ]);
      }
    }

    if (level === 'error' && !extendInfo) {
      breadcrumbs.forEach((v, i) => {
        stringsLog.push([
          { text: `${nowWithPad} ${' | '.repeat(levelIndent)}${'   '.repeat(i)} ${v}`, textColor: 'error' },
        ]);
      });
      if (testFile) {
        stringsLog.push([
          {
            text: `${nowWithPad} ${' | '.repeat(levelIndent)} (file:///${path.resolve(testFile)})`,
            textColor: 'error',
          },
        ]);
      }
      if (funcFile) {
        stringsLog.push([
          {
            text: `${nowWithPad} ${' | '.repeat(levelIndent)} (file:///${path.resolve(funcFile)})`,
            textColor: 'error',
          },
        ]);
      }
    }

    screenshots.forEach((v) => {
      stringsLog.push([
        { text: `${nowWithPad} ${' | '.repeat(levelIndent)} `, textColor: headColor },
        { text: `🖼 screenshot: [${v}]`, textColor: tailColor },
      ]);
    });

    if (level === 'error' && !extendInfo) {
      stringsLog.push([
        { text: `${nowWithPad} ${' | '.repeat(levelIndent)} `, textColor: headColor },
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
  }

  static consoleLog(entries: LogEntrieType[][]): void {
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
      // eslint-disable-next-line no-console
      console.log(line);
    });
  }

  fileLog(texts: string | LogEntrieType[][] = [], fileName = 'output.log'): void {
    const { folder, folderLatest } = this.envs.output;

    let textsJoin = '';
    if (Array.isArray(texts)) {
      textsJoin = texts.map((text) => text.map((log) => log.text || '').join('')).join('\n');
    } else {
      textsJoin = texts.toString();
    }

    // eslint-disable-next-line no-control-regex
    textsJoin = textsJoin.replace(new RegExp(/\[\d+m/gi), '');

    fs.appendFileSync(path.join(folder, fileName), `${textsJoin}\n`);
    fs.appendFileSync(path.join(folderLatest, fileName), `${textsJoin}\n`);
  }

  async log({
    funcFile = '',
    testFile = '',
    text = '',
    screenshot = false,
    fullpage = false,
    level = 'info',
    element = null,
    testStruct = null,
    levelIndent = 0,
    error = null,
    testSource = this.binded.testSource,
    bindedData = this.binded.bindedData,
    extendInfo = false,
    stdOut = true,
    stepId = '',
    logShowFlag = true,
    textColor = 'sane',
    backgroundColor = 'sane',
  }: LogInputType): Promise<void> {
    const { PPD_LOG_DISABLED, PPD_LOG_LEVEL_NESTED, PPD_LOG_SCREENSHOT, PPD_LOG_FULLPAGE } = new Arguments().args;

    const texts = typeof text === 'string' ? [text] : text;

    const levelText = Log.checkLevel(level);
    if (!levelText) return;

    if (levelText !== 'error' && !logShowFlag) return;

    if (levelText === 'error') {
      // debugger;
      // eslint-disable-next-line no-param-reassign
      backgroundColor = 'sane';
    }

    // SKIP LOG BY LEVEL
    if (PPD_LOG_LEVEL_NESTED && levelIndent > PPD_LOG_LEVEL_NESTED && levelText !== 'error') {
      return;
    }

    // NO LOG FILES ONLY STDOUT
    if (PPD_LOG_DISABLED && levelText !== 'error') {
      return;
    }

    try {
      // SCREENSHOT ON ERROR ONLY ONES
      // TODO: 2020-02-05 S.Starodubov get values from env.yaml
      let isScreenshot = PPD_LOG_SCREENSHOT ? screenshot : false;
      let isFullpage = PPD_LOG_FULLPAGE ? fullpage : false;

      if (level === 'error' && levelIndent === 0) {
        [isScreenshot, isFullpage] = [true, true];
      }
      const screenshots = isScreenshot ? await this.screenshot.getScreenshots(element, isFullpage, extendInfo) : [];

      const now = new Date();
      texts.forEach((textString) => {
        const logTexts = this.makeLog(
          levelText,
          levelIndent,
          textString,
          now,
          funcFile,
          testFile,
          extendInfo,
          screenshots,
          error,
          textColor,
          backgroundColor,
        );

        // STDOUT
        if (stdOut) Log.consoleLog(logTexts);

        // EXPORT TEXT LOG
        this.fileLog(logTexts, 'output.log');
        // ENVS TO LOG
        // let dataEnvs = null;
        // if (level === 'env') {
        //   dataEnvs = Object.values(this.envs?.envs || {}).map((val) => omit(val, ['state']));
        // }

        // TODO: 2020-04-28 S.Starodubov todo
        // _.mapValues(testSource, (v) => {
        //   if (!_.isEmpty(v)) {
        //     return v;
        //   }
        // })
        // _.isEmpty(testStruct) ? testSource.filter((v) => !_.isEmpty(v)) : testStruct;
        const testStructNormaize = testStruct && !Object.keys(testStruct).length ? testSource : testStruct;

        const { PPD_DEBUG_MODE } = new Arguments().args;

        // TODO: 2020-02-02 S.Starodubov this two fields need for html
        // dataEnvs,
        // dataEnvsGlobal: level === 'env' ?
        // pick(this.envs, ['args', 'current', 'data', 'results', 'selectors']) : null,
        const logEntry: LogEntry = {
          text: textString,
          time: getNowDateTime(now),
          testStruct: PPD_DEBUG_MODE || level === 'env' ? testStructNormaize : null,
          bindedData: PPD_DEBUG_MODE ? bindedData : null,
          screenshots,
          type: level === 'env' ? 'env' : 'log',
          level,
          levelIndent,
          stepId: bindedData?.stepId || stepId,
        };
        this.envs.log = [...this.envs.log, logEntry];
        this.socket.sendYAML({ type: 'log', data: logEntry, envsId: this.envsId });

        // Export YAML log every step
        const yamlString = `-\n${yaml.dump(logEntry, { lineWidth: 1000, indent: 2 }).replace(/^/gm, ' '.repeat(2))}`;
        this.fileLog(yamlString, 'output.yaml');
      });
    } catch (err) {
      const { PPD_DEBUG_MODE } = new Arguments().args;
      err.message += ' || error in log';
      err.socket = this.socket;
      err.debug = PPD_DEBUG_MODE;
      err.stepId = bindedData?.stepId;
      throw err;
    }
  }
}
