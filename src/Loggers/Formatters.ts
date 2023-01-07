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

const getPrefix = (
  time: Date,
  level: ColorsType,
  levelIndent: number,
): { spacesPrefix: string; timePrefix: string } => {
  const { PPD_LOG_TIMESTAMP_SHOW, PPD_LOG_INDENT_LENGTH } = new Arguments().args;
  const indentString = `|${' '.repeat(PPD_LOG_INDENT_LENGTH - 1)}`.repeat(levelIndent);
  const nowWithPad = PPD_LOG_TIMESTAMP_SHOW ? `${getNowDateTime(time, 'HH:mm:ss.SSS')} - ${level.padEnd(5)}  ` : '';
  const spacesPreffix = nowWithPad ? ' '.repeat(nowWithPad.length) : '';

  return {
    spacesPrefix: `${spacesPreffix}${indentString}`,
    timePrefix: `${nowWithPad}${indentString}`,
  };
};

const getSpliter = (levelIndent = 0): string => '='.repeat(120 - (levelIndent + 1) * 3 - 21);

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
  const message = (errorTyped?.message || '').split(' || ');
  const stack = (errorTyped?.stack || '').split('\n    ');

  const { PPD_LOG_EXTEND } = new Arguments().args;

  const { spacesPrefix, timePrefix } = getPrefix(time, level, levelIndent);
  const headColor: ColorsType = level === 'error' ? 'error' : 'sane';
  const tailColor: ColorsType = level === 'error' ? 'error' : 'info';

  const isExtend = level !== 'error' && extendInfo;
  const isError = level === 'error' && !extendInfo;
  const isErrorTopLevel = isError && levelIndent === 0;
  const isBreadcrumbs = level !== 'error' && !extendInfo && !!breadcrumbs.length && level !== 'raw' && PPD_LOG_EXTEND;
  const isRepeat = isBreadcrumbs && repeat > 1;
  const isTestFile = isError && !!testFile;
  const isFuncFile = isError && !!funcFile;

  const stringsLog: Array<LogEntrieType[] | null | boolean> = [
    [
      { text: isExtend ? spacesPrefix : timePrefix, textColor: headColor, backgroundColor: 'sane' },
      { text, textColor: resolveColor(textColor, level), backgroundColor: resolveBackColor(backgroundColor) },
    ],

    isBreadcrumbs && [
      { text: `${spacesPrefix} `, textColor: headColor, backgroundColor: 'sane' },
      { text: `👣[${breadcrumbs.join(' -> ')}]`, textColor: tailColor, backgroundColor: 'sane' },
    ],

    isRepeat && [
      { text: `${spacesPrefix} `, textColor: headColor, backgroundColor: 'sane' },
      { text: `🔆 repeats left: ${repeat - 1}`, textColor: tailColor, backgroundColor: 'sane' },
    ],

    ...breadcrumbs.map((v, i): LogEntrieType[] | null => {
      if (isError) {
        return [{ text: `${timePrefix}${'   '.repeat(i)} ${v}`, textColor: 'error', backgroundColor: 'sane' }];
      }
      return null;
    }),

    isTestFile && [
      { text: `${timePrefix} (file:///${path.resolve(testFile)})`, textColor: 'error', backgroundColor: 'sane' },
    ],

    isFuncFile && [
      { text: `${timePrefix} (file:///${path.resolve(funcFile)})`, textColor: 'error', backgroundColor: 'sane' },
    ],

    ...screenshots.map((v): LogEntrieType[] => [
      { text: `${timePrefix} `, textColor: headColor, backgroundColor: 'sane' },
      { text: `🖼 screenshot: [${v}]`, textColor: tailColor, backgroundColor: 'sane' },
    ]),

    isError && [
      { text: `${timePrefix} `, textColor: headColor, backgroundColor: 'sane' },
      { text: getSpliter(levelIndent), textColor: tailColor, backgroundColor: 'sane' },
    ],

    ...[...message, getSpliter(), ...stack].map((v): LogEntrieType[] | null => {
      if (isErrorTopLevel) {
        return [
          { text: ' '.repeat(22), textColor: 'error', backgroundColor: 'sane' },
          { text: v, textColor: 'error', backgroundColor: 'sane' },
        ];
      }
      return null;
    }),
  ];

  return stringsLog.filter((v) => v) as LogEntrieType[][];
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
