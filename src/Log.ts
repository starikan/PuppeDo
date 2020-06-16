import path from 'path';
import fs from 'fs';

import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';

import dayjs from 'dayjs';
import yaml from 'js-yaml';

import { paintString, colors } from './Helpers';
import Arguments from './Arguments';
import Screenshot from './Screenshot';
import Environment from './Environment';

type LogEntrieType = { text: string; textColor: Colors; backgroundColor?: Colors };

type LogInputType = {
  text: string;
  funcFile?: string;
  testFile?: string;
  screenshot?: boolean;
  fullpage?: boolean;
  level?: Colors;
  element?: any;
  testStruct?: string;
  levelIndent?: number;
  error?: any;
  testSource?: any;
  bindedData?: any;
  extendInfo?: boolean;
  stdOut?: boolean;
  stepId?: string;
  textColor?: Colors;
  backgroundColor?: Colors;
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

  constructor(envsId: string) {
    const { socket, envsPool: envs, envsId: envsIdNew } = Environment(envsId);
    this.envsId = envsIdNew;
    this.envs = envs;
    this.socket = socket;
    this.binded = {};
    this.screenshot = new Screenshot(envsId);
  }

  bindData(data: { [key: string]: string | Object } = {}): void {
    this.binded = { ...this.binded, ...data };
  }

  static checkLevel(level: number | string): Colors | null {
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
    const ignoreLevels = PPD_LOG_LEVEL_TYPE_IGNORE.map((v: Colors) => levels[v]);

    if (ignoreLevels.includes(inputLevel)) {
      return null;
    }

    // If input level higher or equal then logging
    if (limitLevel <= inputLevel || levels[inputLevel] === 'error') {
      return levels[inputLevel] as Colors;
    }
    return null;
  }

  makeLog(
    level: Colors = 'sane',
    levelIndent: number = 0,
    text: string = '',
    now = dayjs(),
    funcFile = '',
    testFile = '',
    extendInfo: boolean = false,
    screenshots = [],
    error: { message?: string; stack?: string } = {},
    textColor: Colors = 'sane',
    backgroundColor: Colors = 'sane',
  ): LogEntrieType[][] {
    const errorTyped = error;
    const { PPD_LOG_EXTEND } = new Arguments().args;

    const nowWithPad = `${now.format('HH:mm:ss.SSS')} - ${level.padEnd(5)}`;
    const breadcrumbs = this.binded?.testSource?.breadcrumbs || [];

    const headColor: Colors = level === 'error' ? 'error' : 'sane';
    const tailColor: Colors = level === 'error' ? 'error' : 'info';
    const backColor =
      backgroundColor && colors[backgroundColor] >= 30 && colors[backgroundColor] < 38
        ? (colors[colors[backgroundColor] + 10] as Colors)
        : 'sane';

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
      const message = (errorTyped.message || '').split(' || ');
      const stack = (errorTyped.stack || '').split('\n    ');

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
    const { folder, folderLatest } = this.envs.getOutputsFolders();

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
    error = {},
    testSource = this.binded.testSource,
    bindedData = this.binded.bindedData,
    extendInfo = false,
    stdOut = true,
    stepId = '',
    textColor = 'sane',
    backgroundColor = 'sane',
  }: LogInputType): Promise<void> {
    const {
      PPD_DEBUG_MODE,
      PPD_LOG_DISABLED,
      PPD_LOG_LEVEL_NESTED,
      PPD_LOG_SCREENSHOT,
      PPD_LOG_FULLPAGE,
    } = new Arguments().args;

    const levelText = Log.checkLevel(level);
    if (!levelText) return;

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

      const now = dayjs();
      const logTexts = this.makeLog(
        levelText,
        levelIndent,
        text,
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
      let dataEnvs = null;
      if (level === 'env') {
        dataEnvs = mapValues(this.envs?.envs || {}, (val) => omit(val, 'state'));
      }

      // TODO: 2020-04-28 S.Starodubov todo
      // _.mapValues(testSource, (v) => {
      //   if (!_.isEmpty(v)) {
      //     return v;
      //   }
      // })
      // _.isEmpty(testStruct) ? testSource.filter((v) => !_.isEmpty(v)) : testStruct;
      const testStructNormaize = isEmpty(testStruct) ? testSource : testStruct;

      const logEntry: LogEntry = {
        text,
        time: now.format('YYYY-MM-DD_HH-mm-ss.SSS'),
        // TODO: 2020-02-02 S.Starodubov this two fields need for html
        dataEnvs,
        dataEnvsGlobal: level === 'env' ? pick(this.envs, ['args', 'current', 'data', 'results', 'selectors']) : null,
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
    } catch (err) {
      err.message += ' || error in log';
      err.socket = this.socket;
      err.debug = PPD_DEBUG_MODE;
      err.stepId = bindedData?.stepId;
      throw err;
    }
  }
}
