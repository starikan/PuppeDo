import path from 'path';
import yaml from 'js-yaml';
import { Arguments } from '../Arguments';
import { ColorsType, LogEntrieType, LogEntry, LogFormatter } from '../global.d';
import { colors, getNowDateTime } from '../Helpers';

const resolveBackColor = (backgroundColor: ColorsType): ColorsType => {
  let backColor =
    backgroundColor && colors[backgroundColor] >= 30 && colors[backgroundColor] < 38
      ? (colors[colors[backgroundColor] + 10] as ColorsType)
      : backgroundColor;

  if (!Object.keys(colors).includes(backColor)) {
    backColor = 'sane';
  }

  return backColor;
};

const resolveColor = (textColor: ColorsType, level: ColorsType): ColorsType => {
  if (colors[textColor] !== colors.sane) {
    return textColor;
  }

  if (colors[level] === colors.sane) {
    return 'sane';
  }

  return level;
};

// TODO: 2023-01-07 S.Starodubov split this
export const makeLog = ({
  level = 'sane',
  levelIndent = 0,
  text = '',
  time = new Date(),
  funcFile = '',
  testFile = '',
  extendInfo = false,
  screenshots = [],
  error = null,
  textColor = 'sane',
  backgroundColor = 'sane',
  breadcrumbs = [],
  repeat = 1,
}: LogEntry): LogEntrieType[][] => {
  const errorTyped = error;
  const { PPD_LOG_EXTEND, PPD_LOG_TIMESTAMP_SHOW, PPD_LOG_INDENT_LENGTH } = new Arguments().args;

  const indentString = `|${' '.repeat(PPD_LOG_INDENT_LENGTH - 1)}`.repeat(levelIndent);
  const nowWithPad = PPD_LOG_TIMESTAMP_SHOW ? `${getNowDateTime(time, 'HH:mm:ss.SSS')} - ${level.padEnd(5)}  ` : '';
  const spacesPreffix = nowWithPad ? ' '.repeat(nowWithPad.length) : '';
  const headColor: ColorsType = level === 'error' ? 'error' : 'sane';
  const tailColor: ColorsType = level === 'error' ? 'error' : 'info';

  const head: LogEntrieType = {
    text: `${extendInfo && level !== 'error' ? spacesPreffix : nowWithPad}${indentString}`,
    textColor: headColor,
    backgroundColor: 'sane',
  };

  const tail: LogEntrieType = {
    text,
    textColor: resolveColor(textColor, level),
    backgroundColor: resolveBackColor(backgroundColor),
  };

  const stringsLog: LogEntrieType[][] = [[head, tail]];

  if (breadcrumbs && breadcrumbs.length && level !== 'raw' && PPD_LOG_EXTEND && level !== 'error' && !extendInfo) {
    const headText = `${spacesPreffix}${indentString} `;
    const tailText = `👣[${breadcrumbs.join(' -> ')}]`;
    stringsLog.push([
      { text: headText, textColor: headColor, backgroundColor: 'sane' },
      { text: tailText, textColor: tailColor, backgroundColor: 'sane' },
    ]);

    if (repeat > 1) {
      stringsLog.push([
        { text: headText, textColor: headColor, backgroundColor: 'sane' },
        { text: `🔆 repeats left: ${repeat - 1}`, textColor: tailColor, backgroundColor: 'sane' },
      ]);
    }
  }

  if (level === 'error' && !extendInfo) {
    breadcrumbs.forEach((v, i) => {
      stringsLog.push([
        { text: `${nowWithPad}${indentString}${'   '.repeat(i)} ${v}`, textColor: 'error', backgroundColor: 'sane' },
      ]);
    });
    if (testFile) {
      stringsLog.push([
        {
          text: `${nowWithPad}${indentString} (file:///${path.resolve(testFile)})`,
          textColor: 'error',
          backgroundColor: 'sane',
        },
      ]);
    }
    if (funcFile) {
      stringsLog.push([
        {
          text: `${nowWithPad}${indentString} (file:///${path.resolve(funcFile)})`,
          textColor: 'error',
          backgroundColor: 'sane',
        },
      ]);
    }
  }

  (screenshots || []).forEach((v) => {
    stringsLog.push([
      { text: `${nowWithPad}${indentString} `, textColor: headColor, backgroundColor: 'sane' },
      { text: `🖼 screenshot: [${v}]`, textColor: tailColor, backgroundColor: 'sane' },
    ]);
  });

  if (level === 'error' && !extendInfo) {
    stringsLog.push([
      { text: `${nowWithPad}${indentString} `, textColor: headColor, backgroundColor: 'sane' },
      { text: '='.repeat(120 - (levelIndent + 1) * 3 - 21), textColor: tailColor, backgroundColor: 'sane' },
    ]);
  }

  if (level === 'error' && !extendInfo && levelIndent === 0) {
    const message = (errorTyped?.message || '').split(' || ');
    const stack = (errorTyped?.stack || '').split('\n    ');

    [...message, '='.repeat(120 - (levelIndent + 1) * 3 - 21), ...stack].forEach((v) => {
      stringsLog.push([
        { text: ' '.repeat(22), textColor: 'error', backgroundColor: 'sane' },
        { text: v, textColor: 'error', backgroundColor: 'sane' },
      ]);
    });
  }

  return stringsLog;
};

export const formatterEmpty: LogFormatter = async (): Promise<string> => '';

export const formatterEntry: LogFormatter = async (logEntry: LogEntry): Promise<LogEntrieType[][]> => makeLog(logEntry);

export const formatterYamlToString: LogFormatter = async (
  logEntry: LogEntry,
  logEntryTransformed: Partial<LogEntry>,
): Promise<string> => {
  const yamlString = `-\n${yaml
    .dump(logEntryTransformed, { lineWidth: 1000, indent: 2 })
    .replace(/^/gm, ' '.repeat(2))}`;
  return yamlString;
};
