import { Arguments } from '../src/Arguments';
import { Environment } from '../src/Environment';
import {
  consoleLog,
  exporterConsole,
  exporterLogFile,
  exporterLogInMemory,
  exporterSocket,
  exporterYamlLog,
  fileLog,
} from '../src/Loggers/Exporters';
import { formatterEmpty, formatterEntry, formatterYamlToString } from '../src/Loggers/Formatters';
import {
  logArgs,
  logDebug,
  logError,
  logExtend,
  logExtendFileInfo,
  logTimer,
} from '../src/Loggers/CustomLogEntries';
import { transformerEquity, transformerYamlLog } from '../src/Loggers/Transformers';

jest.mock('../src/Environment');

const mockEnvironmentClass = Environment as jest.MockedClass<typeof Environment>;

describe('Loggers extra coverage', () => {
  let appendToFile: jest.Mock;
  let socket: { sendYAML: jest.Mock };
  let envLog: Array<unknown>;

  beforeEach(() => {
    jest.clearAllMocks();

    appendToFile = jest.fn();
    socket = { sendYAML: jest.fn() };
    envLog = [];

    mockEnvironmentClass.mockImplementation(
      () =>
        ({
          getLogger: jest.fn().mockReturnValue({ exporter: { appendToFile } }),
          getSocket: jest.fn().mockReturnValue(socket),
          getEnvInstance: jest.fn().mockReturnValue({ log: envLog }),
          getOutput: jest.fn().mockReturnValue({ folderFull: 'C:/out', folderLatest: 'C:/latest', folder: 'C:/out' }),
        } as any),
    );
  });

  test('transformers', async () => {
    const entry = { level: 'info', text: 'hi', error: new Error('boom') } as any;
    expect(await transformerEquity(entry)).toBe(entry);
    const yaml = await transformerYamlLog(entry);
    expect((yaml as any).error).toBeUndefined();
  });

  test('exporters respect skipThis and send data', async () => {
    const logEntry = { level: 'info', text: 'hi' } as any;
    const logEntryFormated = [[{ text: 'hi', textColor: 'sane', backgroundColor: 'sane' }]] as any;

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    await exporterConsole(logEntry, logEntryFormated, '', { envsId: 'env', skipThis: false });
    await exporterConsole(logEntry, logEntryFormated, '', { envsId: 'env', skipThis: true });

    await exporterLogFile(logEntry, logEntryFormated, '', { envsId: 'env', skipThis: false });
    await exporterLogFile(logEntry, logEntryFormated, '', { envsId: 'env', skipThis: true });

    await exporterYamlLog(logEntry, logEntryFormated, 'yaml', { envsId: 'env', skipThis: false });

    await exporterSocket(logEntry, logEntryFormated, '', { envsId: 'env', skipThis: false });

    await exporterLogInMemory(logEntry, logEntryFormated, '', { envsId: 'env', skipThis: false });

    expect(consoleSpy).toHaveBeenCalled();
    expect(appendToFile).toHaveBeenCalled();
    expect(socket.sendYAML).toHaveBeenCalled();
    expect(envLog.length).toBe(1);

    consoleSpy.mockRestore();
  });

  test('consoleLog handles missing background color', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    consoleLog([[{ text: 'a', textColor: 'sane', backgroundColor: undefined as any }]] as any);
    expect(consoleSpy).toHaveBeenCalledWith('a');
    consoleSpy.mockRestore();
  });

  test('consoleLog applies background color', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    consoleLog([[{ text: 'a', textColor: 'sane', backgroundColor: 'redBackground' }]] as any);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('fileLog handles string input', () => {
    fileLog('env', 'plain', 'out.log');
    expect(appendToFile).toHaveBeenCalledWith('out.log', 'plain\n');
  });

  test('fileLog handles default inputs', () => {
    fileLog('env');
    expect(appendToFile).toHaveBeenCalledWith('output.log', '\n');
  });

  test('fileLog handles array input', () => {
    fileLog('env', [[{ text: 'a' }, { text: 'b' }]] as any, 'out.log');
    expect(appendToFile).toHaveBeenCalledWith('out.log', 'ab\n');
  });

  test('formatterEntry covers error branches and color resolution', async () => {
    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_TIMESTAMP_SHOW: false }, {}, true);
    const error = new Error('boom');
    error.stack = 'stack-line-1\n    stack-line-2';

    const formatted = await formatterEntry(
      {
      level: 'error',
      levelIndent: 0,
      text: 'err',
      time: new Date('2025-01-01T00:00:00.000Z'),
      extendInfo: false,
      breadcrumbs: ['a', 'b'],
      repeat: 2,
      testFile: 'test.ts',
      funcFile: 'func.ts',
      screenshots: ['shot.png'],
      textColor: 'red',
      backgroundColor: 'unknown' as any,
      error,
      } as any,
      {},
    );

    const flat = Array.isArray(formatted) ? formatted.flat() : [];
    expect(flat.some((v) => v.text.includes('file:///'))).toBe(true);
    expect(flat.some((v) => v.text.includes('🖼 screenshot'))).toBe(true);
    expect(flat.some((v) => v.text.includes('boom'))).toBe(true);
    expect(flat.some((v) => v.backgroundColor === 'sane')).toBe(true);
    expect(flat.some((v) => v.textColor === 'red')).toBe(true);
  });

  test('formatterYamlToString returns yaml string', async () => {
    const yamlString = await formatterYamlToString({} as any, { level: 'info', text: 'hi' });
    expect(yamlString).toContain('level: info');
    expect(yamlString).toContain('text: hi');
  });

  test('formatterEmpty returns empty string', async () => {
    const result = await formatterEmpty({} as any, {} as any);
    expect(result).toBe('');
  });

  test('formatterEntry includes breadcrumbs and repeat info', async () => {
    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_TIMESTAMP_SHOW: false }, {}, true);

    const formatted = await formatterEntry(
      {
        level: 'info',
        levelIndent: 1,
        text: 'hello',
        breadcrumbs: ['a', 'b'],
        repeat: 2,
      } as any,
      {},
    );

    const flat = Array.isArray(formatted) ? formatted.flat() : [];
    expect(flat.some((v) => v.text.includes('👣['))).toBe(true);
    expect(flat.some((v) => v.text.includes('repeats left'))).toBe(true);
  });

  test('formatterEntry resolves colors and extend info', async () => {
    new Arguments({ PPD_LOG_EXTEND: false, PPD_LOG_TIMESTAMP_SHOW: true }, {}, true);

    const formatted = await formatterEntry(
      {
        level: 'info',
        levelIndent: 0,
        text: 'hello',
        extendInfo: true,
        textColor: 'sane',
        backgroundColor: 'red',
      } as any,
      {},
    );

    const flat = Array.isArray(formatted) ? formatted.flat() : [];
    expect(flat.some((v) => v.textColor === 'info')).toBe(true);
    expect(flat.some((v) => v.backgroundColor === 'redBackground')).toBe(true);
  });

  test('formatterEntry keeps sane color for raw level', async () => {
    new Arguments({ PPD_LOG_TIMESTAMP_SHOW: false }, {}, true);
    const formatted = await formatterEntry(
      { level: 'raw', levelIndent: 0, text: 'raw', textColor: 'sane', backgroundColor: 'sane' } as any,
      {},
    );
    const flat = Array.isArray(formatted) ? formatted.flat() : [];
    expect(flat.some((v) => v.textColor === 'sane')).toBe(true);
  });

  test('formatterEntry normalizes invalid background color', async () => {
    new Arguments({ PPD_LOG_TIMESTAMP_SHOW: false }, {}, true);
    const formatted = await formatterEntry(
      { level: 'info', levelIndent: 0, text: 'x', textColor: 'sane', backgroundColor: 'invalid' as any } as any,
      {},
    );
    const flat = Array.isArray(formatted) ? formatted.flat() : [];
    expect(flat.some((v) => v.backgroundColor === 'sane')).toBe(true);
  });

  test('formatterEntry uses default values when missing', async () => {
    new Arguments({ PPD_LOG_TIMESTAMP_SHOW: false }, {}, true);
    const formatted = await formatterEntry({} as any, {});
    expect(Array.isArray(formatted)).toBe(true);
  });

  test('custom log entries helpers', async () => {
    const log = jest.fn().mockResolvedValue(undefined);

    await logExtendFileInfo(log, { envsId: 'env' });
    await logExtendFileInfo(log, { envsId: '' });

    await logError(log, { message: 'm1\nm2', stack: 's1\n    s2' } as any);

    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_STEPID: true }, {}, true);
    await logTimer(log, 100n, 200n, { levelIndent: 1, stepId: 'step-1' });

    new Arguments({ PPD_LOG_EXTEND: false }, {}, true);
    await logTimer(log, 100n, 200n, { levelIndent: 1, stepId: 'step-1' });

    await logExtend(
      log,
      {
        data: { a: 1 },
        bindData: {},
        selectors: {},
        bindSelectors: {},
        bindResults: {},
        options: {},
        levelIndent: 0,
      },
      false,
    );

    await logExtend(
      log,
      {
        data: { a: 1 },
        bindData: {},
        selectors: {},
        bindSelectors: {},
        bindResults: {},
        options: {},
        levelIndent: 0,
      },
      true,
    );

    await logArgs(log);
    await logDebug(log, { data: { a: 1 }, selectors: { b: 2 } });
    await logDebug(log, { data: {}, selectors: {} });

    expect(log).toHaveBeenCalled();
  });

  test('custom log entries handle defaults and empty data', async () => {
    const log = jest.fn().mockResolvedValue(undefined);

    mockEnvironmentClass.mockImplementationOnce(
      () =>
        ({
          getOutput: jest.fn().mockReturnValue({}),
        } as any),
    );

    await logExtendFileInfo(log, { envsId: 'env' });

    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_STEPID: false }, {}, true);
    await logTimer(log, 100n, 200n, { stepId: 's1' } as any);

    await logExtend(
      log,
      {
        data: {},
        bindData: {},
        selectors: {},
        bindSelectors: {},
        bindResults: {},
        options: {},
        levelIndent: 0,
      },
      true,
    );

    expect(log).toHaveBeenCalled();
  });

  test('logExtend logs when extend enabled', async () => {
    const log = jest.fn().mockResolvedValue(undefined);

    new Arguments({ PPD_LOG_EXTEND: true }, {}, true);
    await logExtend(
      log,
      {
        data: { a: 1 },
        bindData: {},
        selectors: {},
        bindSelectors: {},
        bindResults: {},
        options: {},
        levelIndent: 0,
      },
      false,
    );

    expect(log).toHaveBeenCalledWith(expect.objectContaining({ level: 'info' }));
  });

  test('logExtend uses default levelIndent', async () => {
    const log = jest.fn().mockResolvedValue(undefined);

    new Arguments({ PPD_LOG_EXTEND: true }, {}, true);
    await logExtend(
      log,
      {
        data: { a: 1 },
        bindData: {},
        selectors: {},
        bindSelectors: {},
        bindResults: {},
        options: {},
        levelIndent: undefined as any,
      },
      false,
    );

    expect(log).toHaveBeenCalled();
  });

  test('logExtend uses default isError parameter', async () => {
    const log = jest.fn().mockResolvedValue(undefined);

    new Arguments({ PPD_LOG_EXTEND: true }, {}, true);
    await logExtend(log, {
      data: { a: 1 },
      bindData: {},
      selectors: {},
      bindSelectors: {},
      bindResults: {},
      options: {},
      levelIndent: 0,
    });

    expect(log).toHaveBeenCalled();
  });

  test('logError skips when message and stack missing', async () => {
    const log = jest.fn().mockResolvedValue(undefined);
    await logError(log, { message: '', stack: '' } as any);
    expect(log).not.toHaveBeenCalled();
  });

  test('logExtendFileInfo logs output path when envsId present', async () => {
    const log = jest.fn().mockResolvedValue(undefined);
    await logExtendFileInfo(log, { envsId: 'env' });
    expect(log).toHaveBeenCalledWith(expect.objectContaining({ text: expect.arrayContaining([expect.stringContaining('file:///')]) }));
  });

  test('logTimer includes stepId when enabled', async () => {
    const log = jest.fn().mockResolvedValue(undefined);
    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_STEPID: true }, {}, true);
    await logTimer(log, 1n, 2n, { levelIndent: 0, stepId: 's1' });
    expect(log).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining('[s1]') }));
  });

  test('logExtend respects extend flag with empty data', async () => {
    const log = jest.fn().mockResolvedValue(undefined);
    new Arguments({ PPD_LOG_EXTEND: true }, {}, true);
    await logExtend(
      log,
      { data: {}, bindData: {}, selectors: {}, bindSelectors: {}, bindResults: {}, options: {}, levelIndent: 1 },
      false,
    );
    expect(log).toHaveBeenCalled();
  });

  test('custom log entries handle missing message/stack and empty extend', async () => {
    const log = jest.fn().mockResolvedValue(undefined);

    await logError(log, { message: '', stack: 's1\n    s2' } as any);
    await logError(log, { message: 'm1', stack: '' } as any);

    new Arguments({ PPD_LOG_EXTEND: false }, {}, true);
    await logExtend(
      log,
      {
        data: {},
        bindData: {},
        selectors: {},
        bindSelectors: {},
        bindResults: {},
        options: {},
        levelIndent: 0,
      },
      true,
    );

    expect(log).toHaveBeenCalled();
  });
});
