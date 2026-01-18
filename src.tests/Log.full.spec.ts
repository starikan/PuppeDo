import fs from 'fs';
import path from 'path';
import { Arguments } from '../src/Arguments';
import * as Helpers from '../src/Helpers';
import { Environment } from '../src/Environment';
import { Log, LogExports, LogOptions } from '../src/Log';
import Screenshot from '../src/Screenshot';

jest.mock('../src/Environment');
jest.mock('../src/Screenshot');

const mockEnvironmentClass = Environment as jest.MockedClass<typeof Environment>;
const mockScreenshotClass = Screenshot as jest.MockedClass<typeof Screenshot>;

const outputFolder = '.temp/log-full';
const distOutput = path.join('dist', 'output.html');
let outputDir: string;
let outputLatest: string;

describe('Log full coverage', () => {
  let testTree: { updateStep: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    fs.mkdirSync(path.dirname(distOutput), { recursive: true });
    fs.writeFileSync(distOutput, 'html');

    outputDir = path.join(outputFolder, 'exports');
    outputLatest = path.join(outputFolder, 'exports-latest');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.mkdirSync(outputLatest, { recursive: true });

    testTree = { updateStep: jest.fn() };

    mockEnvironmentClass.mockImplementation(
      () =>
        ({
          getEnvInstance: jest.fn().mockReturnValue({
            testTree,
            log: [],
          }),
          getSocket: jest.fn().mockReturnValue({ id: 'socket' }),
          getOutput: jest.fn().mockReturnValue({ folder: outputDir, folderLatest: outputLatest }),
        } as any),
    );

    mockScreenshotClass.mockImplementation(
      () =>
        ({
          getScreenshotsLogEntry: jest.fn().mockResolvedValue(['s1', 's2']),
        } as any),
    );
  });

  test('LogExports.resolveOutputHtmlFile picks dist output', () => {
    expect(LogExports.resolveOutputHtmlFile()).toContain('dist');
  });

  test('LogExports.resolveOutputHtmlFile falls back to module output', () => {
    const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    const resolved = LogExports.resolveOutputHtmlFile();
    expect(resolved).toContain(path.join('node_modules', '@puppedo', 'core', 'dist', 'output.html'));

    existsSpy.mockRestore();
  });

  test('LogExports.initOutput creates folders', () => {
    new Arguments({ PPD_OUTPUT: outputFolder }, {}, true);
    const output = LogExports.initOutput('env-1');

    expect(path.normalize(output.folder)).toContain(path.normalize(outputFolder));
    expect(fs.existsSync(output.folder)).toBe(true);
    expect(fs.existsSync(output.folderLatest)).toBe(true);
  });

  test('LogExports.initOutput skips creating existing folder', () => {
    const nowSpy = jest.spyOn(Helpers, 'getNowDateTime').mockReturnValue('fixed');
    new Arguments({ PPD_OUTPUT: outputFolder }, {}, true);

    const expectedFolder = path.join(outputFolder, 'fixed_env-1');
    fs.mkdirSync(expectedFolder, { recursive: true });

    const output = LogExports.initOutput('env-1');
    expect(output.folder).toBe(expectedFolder);

    nowSpy.mockRestore();
  });

  test('LogExports.initOutput creates missing root and latest', () => {
    const tempRoot = path.join(outputFolder, 'fresh');
    if (fs.existsSync(tempRoot)) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }

    new Arguments({ PPD_OUTPUT: tempRoot }, {}, true);
    const output = LogExports.initOutput('env-2');

    expect(fs.existsSync(tempRoot)).toBe(true);
    expect(fs.existsSync(output.folderLatest)).toBe(true);
  });

  test('LogExports.initOutput clears latest folder when exists', () => {
    new Arguments({ PPD_OUTPUT: outputFolder }, {}, true);

    const oldFile = path.join(outputFolder, 'latest', 'old.txt');
    fs.mkdirSync(path.dirname(oldFile), { recursive: true });
    fs.writeFileSync(oldFile, 'old');

    LogExports.initOutput('env-3');

    expect(fs.existsSync(oldFile)).toBe(false);
  });

  test('LogExports saveToFile and appendToFile write to both folders', () => {
    const exporter = new LogExports('env-1');

    exporter.saveToFile('a.txt', '1');
    exporter.appendToFile('a.txt', '2');

    expect(fs.readFileSync(path.join(outputDir, 'a.txt')).toString()).toBe('12');
    expect(fs.readFileSync(path.join(outputLatest, 'a.txt')).toString()).toBe('12');
  });

  test('LogOptions bindOptions and addLogPipe', () => {
    const options = new LogOptions({ stdOut: true }, true);
    options.bindOptions({ stdOut: false });
    options.bindOptions();
    options.addLogPipe({ transformer: jest.fn(), formatter: jest.fn(), exporter: jest.fn() } as any);

    expect(options.options.stdOut).toBe(false);
    expect(options.options.loggerPipes.length).toBe(1);
  });

  test('LogOptions initializes empty loggerPipes', () => {
    const options = new LogOptions({}, true);
    expect(options.options.loggerPipes).toEqual([]);
  });

  test('Log.checkLevel and isManualSkipEntry', () => {
    new Arguments({ PPD_LOG_LEVEL_TYPE_IGNORE: ['info'], PPD_LOG_DISABLED: false, PPD_LOG_LEVEL_NESTED: 1 }, {}, true);

    expect(Log.checkLevel('info')).toBe(false);
    expect(Log.checkLevel('raw')).toBe(true);

    const skip = Log.isManualSkipEntry('info', true, true, 2);
    expect(skip).toBe(true);
  });

  test('Log.isManualSkipEntry respects PPD_LOG_DISABLED', () => {
    new Arguments({ PPD_LOG_DISABLED: true, PPD_LOG_LEVEL_NESTED: 0 }, {}, true);
    expect(Log.isManualSkipEntry('info', true, true, 0)).toBe(true);
  });

  test('Log.isManualSkipEntry skips when logShowFlag or logThis is false', () => {
    new Arguments({ PPD_LOG_DISABLED: false, PPD_LOG_LEVEL_NESTED: 0 }, {}, true);
    expect(Log.isManualSkipEntry('info', false, true, 0)).toBe(true);
    expect(Log.isManualSkipEntry('info', true, false, 0)).toBe(true);
  });

  test('Log.isManualSkipEntry returns false when nothing to skip', () => {
    new Arguments({ PPD_LOG_DISABLED: false, PPD_LOG_LEVEL_NESTED: 0, PPD_LOG_LEVEL_TYPE_IGNORE: [] }, {}, true);
    expect(Log.isManualSkipEntry('info', true, true, 0)).toBe(false);
  });

  test('Log.isManualSkipEntry skips when nested level exceeded', () => {
    new Arguments({ PPD_LOG_DISABLED: false, PPD_LOG_LEVEL_NESTED: 1, PPD_LOG_LEVEL_TYPE_IGNORE: [] }, {}, true);
    expect(Log.isManualSkipEntry('info', true, true, 2)).toBe(true);
  });

  test('Log.isManualSkipEntry skips unknown levels', () => {
    new Arguments({ PPD_LOG_DISABLED: false, PPD_LOG_LEVEL_NESTED: 0, PPD_LOG_LEVEL_TYPE_IGNORE: [] }, {}, true);
    expect(Log.isManualSkipEntry('unknown' as any, true, true, 0)).toBe(true);
  });

  test('Log.isManualSkipEntry does not skip error level', () => {
    new Arguments({ PPD_LOG_DISABLED: true, PPD_LOG_LEVEL_NESTED: 0, PPD_LOG_LEVEL_TYPE_IGNORE: [] }, {}, true);
    expect(Log.isManualSkipEntry('error', true, false, 5)).toBe(false);
  });

  test('Log.getScreenshots handles error level', async () => {
    new Arguments({ PPD_LOG_SCREENSHOT: true, PPD_LOG_FULLPAGE: true }, {}, true);
    const log = new Log('env-1');

    const shots = await log.getScreenshots({ screenshot: false, fullpage: false }, 'error', 0, false, null as any);
    expect(shots).toEqual(['s1', 's2']);
  });

  test('Log.getScreenshots skips when level ignored', async () => {
    new Arguments({ PPD_LOG_LEVEL_TYPE_IGNORE: ['info'] }, {}, true);
    const log = new Log('env-1');

    const shots = await log.getScreenshots({ screenshot: true, fullpage: true }, 'info', 0, false, null as any);
    expect(shots).toEqual([]);
  });

  test('Log.getScreenshots disables screenshots for extendInfo', async () => {
    new Arguments({ PPD_LOG_SCREENSHOT: true, PPD_LOG_FULLPAGE: true }, {}, true);
    const getScreenshotsLogEntry = jest.fn().mockResolvedValue([]);
    mockScreenshotClass.mockImplementationOnce(
      () =>
        ({
          getScreenshotsLogEntry,
        } as any),
    );
    const log = new Log('env-1');

    await log.getScreenshots({ screenshot: true, fullpage: true }, 'info', 0, true, null as any);

    expect(getScreenshotsLogEntry).toHaveBeenCalledWith(false, false, null, undefined, undefined);
  });

  test('Log.runPipes handles pipe errors', async () => {
    new LogOptions(
      {
        stdOut: true,
        loggerPipes: [
          {
            transformer: jest.fn().mockRejectedValue(new Error('fail')),
            formatter: jest.fn(),
            exporter: jest.fn(),
          },
        ],
      },
      true,
    );

    const log = new Log('env-1');
    await log.runPipes([{ level: 'info', text: 'x' } as any]);
  });

  test('Log.runPipes logs on pipe exception', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    new LogOptions(
      {
        stdOut: true,
        loggerPipes: [
          {
            transformer: jest.fn().mockRejectedValue(new Error('boom')),
            formatter: jest.fn(),
            exporter: jest.fn(),
          },
        ],
      },
      true,
    );

    const log = new Log('env-1');
    await log.runPipes([{ level: 'info', text: 'x' } as any]);

    expect(consoleSpy).toHaveBeenCalledWith('Error in logger pipe: boom');
    consoleSpy.mockRestore();
  });

  test('Log.runPipes executes exporter on success', async () => {
    const exporter = jest.fn().mockResolvedValue(undefined);
    new LogOptions(
      {
        stdOut: true,
        loggerPipes: [
          {
            transformer: jest.fn().mockResolvedValue({}),
            formatter: jest.fn().mockResolvedValue('ok'),
            exporter,
          },
        ],
      },
      true,
    );

    const log = new Log('env-1');
    await log.runPipes([{ level: 'info', text: 'x' } as any]);

    expect(exporter).toHaveBeenCalled();
  });

  test('Log.runPipes sets skipThis when stdOut is false', async () => {
    const exporter = jest.fn().mockResolvedValue(undefined);
    new LogOptions(
      {
        stdOut: false,
        loggerPipes: [
          {
            transformer: jest.fn().mockResolvedValue({}),
            formatter: jest.fn().mockResolvedValue('ok'),
            exporter,
          },
        ],
      },
      true,
    );

    const log = new Log('env-1');
    await log.runPipes([{ level: 'info', text: 'x' } as any], false);

    expect(exporter).toHaveBeenCalledWith(
      expect.any(Object),
      'ok',
      'ok',
      expect.objectContaining({ skipThis: true }),
    );
  });

  test('Log.runPipes uses default stdOut when not set', async () => {
    const exporter = jest.fn().mockResolvedValue(undefined);
    new LogOptions(
      {
        loggerPipes: [
          {
            transformer: jest.fn().mockResolvedValue({}),
            formatter: jest.fn().mockResolvedValue('ok'),
            exporter,
          },
        ],
      },
      true,
    );

    const log = new Log('env-1');
    await log.runPipes([{ level: 'info', text: 'x' } as any], false);

    expect(exporter).toHaveBeenCalledWith(
      expect.any(Object),
      'ok',
      'ok',
      expect.objectContaining({ skipThis: false }),
    );
  });

  test('Log.runPipes sets skipThis when manualSkipEntry is true', async () => {
    const exporter = jest.fn().mockResolvedValue(undefined);
    new LogOptions(
      {
        stdOut: true,
        loggerPipes: [
          {
            transformer: jest.fn().mockResolvedValue({}),
            formatter: jest.fn().mockResolvedValue('ok'),
            exporter,
          },
        ],
      },
      true,
    );

    const log = new Log('env-1');
    await log.runPipes([{ level: 'info', text: 'x' } as any], true);

    expect(exporter).toHaveBeenCalledWith(
      expect.any(Object),
      'ok',
      'ok',
      expect.objectContaining({ skipThis: true }),
    );
  });

  test('Log.updateTree fills timer payload', async () => {
    const exporter = jest.fn().mockResolvedValue(undefined);
    new LogOptions(
      {
        loggerPipes: [
          {
            transformer: jest.fn().mockResolvedValue({}),
            formatter: jest.fn().mockResolvedValue('ok'),
            exporter,
          },
        ],
      },
      true,
    );

    const log = new Log('env-1');
    const timeStart = new Date('2025-01-01T00:00:00.000Z');
    const timeEnd = new Date('2025-01-01T00:00:01.000Z');

    await log.log({
      text: 'timer',
      level: 'timer',
      stepId: 's1',
      logMeta: { timeStart, timeEnd },
    } as any);

    expect(testTree.updateStep).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ timeStart, timeEnd }),
      }),
    );
  });

  test('Log.updateTree handles missing logMeta', () => {
    const log = new Log('env-1');
    (log as any).updateTree([
      {
        level: 'timer',
        stepId: 's1',
        logMeta: undefined,
      } as any,
    ]);

    expect(testTree.updateStep).toHaveBeenCalled();
  });

  test('Log.log uses default breadcrumbs and repeat', async () => {
    const log = new Log('env-1');
    const runPipesSpy = jest.spyOn(log, 'runPipes').mockResolvedValue(undefined);

    await log.log({ text: 'x', level: 'info' } as any);

    const [entries] = runPipesSpy.mock.calls[0];
    expect(entries[0].breadcrumbs).toEqual([]);
    expect(entries[0].repeat).toBe(1);
  });

  test('Log.log keeps provided breadcrumbs', async () => {
    const log = new Log('env-1');
    const runPipesSpy = jest.spyOn(log, 'runPipes').mockResolvedValue(undefined);

    await log.log({ text: 'x', level: 'info', logMeta: { breadcrumbs: ['a'] } } as any);

    const [entries] = runPipesSpy.mock.calls[0];
    expect(entries[0].breadcrumbs).toEqual(['a']);
  });

  test('Log.log applies default text and level', async () => {
    const log = new Log('env-1');
    const runPipesSpy = jest.spyOn(log, 'runPipes').mockResolvedValue(undefined);

    await log.log({} as any);

    const [entries] = runPipesSpy.mock.calls[0];
    expect(entries[0].text).toBe('');
    expect(entries[0].level).toBe('raw');
  });

  test('Log.log propagates error context defaults on failure', async () => {
    const log = new Log('env-1');
    jest.spyOn(log, 'runPipes').mockRejectedValue(new Error('boom'));

    let thrown: any;
    try {
      await log.log({ text: 'x', level: 'info', stepId: null as any } as any);
    } catch (err) {
      thrown = err;
    }

    expect(thrown.message).toContain('error in log');
    expect(thrown.stepId).toBe('');
  });

  test('Log.bulkLog and updateTree for timer', async () => {
    const log = new Log('env-1');
    await log.bulkLog([
      { level: 'timer', text: 't', stepId: 's1', logMeta: { timeStart: new Date(), timeEnd: new Date() } } as any,
    ]);

    expect(testTree.updateStep).toHaveBeenCalled();
  });

  test('Log.bulkLog updates tree for non-timer entries', async () => {
    const log = new Log('env-1');
    await log.bulkLog([{ level: 'info', text: 'x', stepId: 's2' } as any]);

    expect(testTree.updateStep).toHaveBeenCalledWith(expect.objectContaining({ stepId: 's2' }));
  });

  test('Log.log handles pipe error and augments error', async () => {
    const log = new Log('env-1');
    const runPipesSpy = jest.spyOn(log, 'runPipes').mockRejectedValue(new Error('boom'));

    new Arguments({ PPD_DEBUG_MODE: true }, {}, true);

    await expect(log.log({ text: 'x', level: 'info', stepId: 's1' })).rejects.toMatchObject({
      debug: true,
      stepId: 's1',
    });

    runPipesSpy.mockRestore();
  });

  test('Log.log uses raw level for null and overrides error background', async () => {
    const log = new Log('env-1');
    const runPipesSpy = jest.spyOn(log, 'runPipes').mockResolvedValue(undefined);

    await log.log({ text: 'x', level: null as any, stepId: 's1' });
    expect(runPipesSpy.mock.calls[0][0][0].level).toBe('raw');

    runPipesSpy.mockClear();
    await log.log({ text: 'x', level: 'error', stepId: 's2', logOptions: { backgroundColor: 'red' } as any });
    expect(runPipesSpy.mock.calls[0][0][0].backgroundColor).toBe('sane');

    runPipesSpy.mockRestore();
  });

  test('Log.log uses default stepId and logMeta fallbacks', async () => {
    const log = new Log('env-1');
    const runPipesSpy = jest.spyOn(log, 'runPipes').mockResolvedValue(undefined);

    await log.log({ text: 'x', level: 'info', logMeta: {} as any } as any);

    const entry = runPipesSpy.mock.calls[0][0][0];
    expect(entry.stepId).toBe('');
    expect(entry.breadcrumbs).toEqual([]);
    expect(entry.repeat).toBe(1);

    runPipesSpy.mockRestore();
  });

  test('Log.log keeps repeat when logMeta.repeat is zero', async () => {
    const log = new Log('env-1');
    const runPipesSpy = jest.spyOn(log, 'runPipes').mockResolvedValue(undefined);

    await log.log({ text: 'x', level: 'info', stepId: 's1', logMeta: { repeat: 0 } } as any);

    const entry = runPipesSpy.mock.calls[0][0][0];
    expect(entry.repeat).toBe(0);

    runPipesSpy.mockRestore();
  });

  test('Log.log updates timer entries even without logMeta', async () => {
    const log = new Log('env-1');
    await log.log({ text: 't', level: 'timer', stepId: 's1' } as any);

    expect(testTree.updateStep).toHaveBeenCalledWith(expect.objectContaining({ stepId: 's1' }));
  });
});
