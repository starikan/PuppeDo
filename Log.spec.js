const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const dayjs = require('dayjs');
const walkSync = require('walk-sync');

const Log = require('./Log');
const { Arguments } = require('./Arguments');

const clearFiles = fileName => {
  const [folder, folderLatest] = [path.join('.temp', 'folder'), path.join('.temp', 'folderLatest')];
  if (fs.existsSync(path.join(folder, fileName))) {
    fs.unlinkSync(path.join(folder, fileName));
  }
  if (fs.existsSync(path.join(folderLatest, fileName))) {
    fs.unlinkSync(path.join(folderLatest, fileName));
  }
};

describe('Log', () => {
  let logger;

  beforeEach(() => {
    logger = new Log();
  });

  test('Constructor', () => {
    expect(logger.envs).toBeDefined();
    expect(logger.socket).toBeDefined();
    expect(logger.envsId).toBeDefined();
    expect(logger.binded).toBeDefined();
  });

  describe('Write into console', () => {
    beforeEach(() => {
      console.log = jest.fn();
    });

    test('Console with colorization', () => {
      logger.consoleLog([
        [
          ['info ', 'sane'],
          ['text', 'info'],
        ],
      ]);
      expect(console.log).toHaveBeenCalledWith('\u001b[0minfo \u001b[0m\u001b[36mtext\u001b[0m');
    });

    test('Console with default colorization', () => {
      logger.consoleLog([[['info ', 'sane'], ['text']]]);
      expect(console.log).toHaveBeenCalledWith('\u001b[0minfo \u001b[0m\u001b[0mtext\u001b[0m');
    });

    test('Console multiline', () => {
      logger.consoleLog([
        [['info '], ['text']],
        [['info '], ['text']],
      ]);
      expect(console.log).toHaveBeenCalledWith('\u001b[0minfo \u001b[0m\u001b[0mtext\u001b[0m');
      expect(console.log).toHaveBeenCalledWith('\u001b[0minfo \u001b[0m\u001b[0mtext\u001b[0m');
    });
  });

  describe('Write log into files', () => {
    const [folder, folderLatest] = [path.join('.temp', 'folder'), path.join('.temp', 'folderLatest')];

    beforeAll(() => {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
      if (!fs.existsSync(folderLatest)) {
        fs.mkdirSync(folderLatest);
      }
    });

    test('Should thrown error if no folder to output', () => {
      expect(() => logger.fileLog()).toThrow({ message: 'There is no output folder' });
      logger.envs.output = { folder };
      expect(() => logger.fileLog()).toThrow({ message: 'There is no output folder' });
      logger.envs.output = { folderLatest };
      expect(() => logger.fileLog()).toThrow({ message: 'There is no output folder' });
    });
    test('Simple output to default file', () => {
      logger.envs.output = { folder, folderLatest };

      clearFiles('output.log');
      logger.fileLog([
        [
          ['info ', 'sane'],
          ['text', 'info'],
        ],
      ]);
      expect(fs.readFileSync(path.join(folder, 'output.log')).toString()).toBe('info text\n');
      expect(fs.readFileSync(path.join(folderLatest, 'output.log')).toString()).toBe('info text\n');
    });
    test('Write to optional file', () => {
      logger.envs.output = { folder, folderLatest };

      clearFiles('output_another.log');
      logger.fileLog(
        [
          [
            ['info ', 'sane'],
            ['text', 'info'],
          ],
        ],
        'output_another.log',
      );
      expect(fs.readFileSync(path.join(folder, 'output_another.log')).toString()).toBe('info text\n');
      expect(fs.readFileSync(path.join(folderLatest, 'output_another.log')).toString()).toBe('info text\n');
    });
    test('Not standart input', () => {
      logger.envs.output = { folder, folderLatest };

      clearFiles('output.log');
      logger.fileLog('foo');
      expect(fs.readFileSync(path.join(folder, 'output.log')).toString()).toBe('foo\n');

      clearFiles('output.log');
      logger.fileLog([[[], ['text', 'info']]]);
      expect(fs.readFileSync(path.join(folder, 'output.log')).toString()).toBe('text\n');
    });
  });

  test('bindData', () => {
    logger.bindData({ foo: 'bar' });
    expect(logger.binded).toEqual({ foo: 'bar' });
    logger.bindData({ foo: 'bar' });
    expect(logger.binded).toEqual({ foo: 'bar' });
    logger.bindData({ gii: 'huu' });
    expect(logger.binded).toEqual({ foo: 'bar', gii: 'huu' });
    logger.bindData('foo');
    expect(logger.binded).toEqual({ foo: 'bar', gii: 'huu' });
  });

  test('checkLevel', () => {
    expect(logger.checkLevel(0)).toBe('raw');
    expect(logger.checkLevel(1)).toBe('timer');
    expect(logger.checkLevel(2)).toBe('debug');
    expect(logger.checkLevel(3)).toBe('info');
    expect(logger.checkLevel(4)).toBe('test');
    expect(logger.checkLevel(5)).toBe('warn');
    expect(logger.checkLevel(6)).toBe('error');
    expect(logger.checkLevel(7)).toBe('env');
    expect(logger.checkLevel('raw')).toBe('raw');
    expect(logger.checkLevel('timer')).toBe('timer');
    expect(logger.checkLevel('debug')).toBe('debug');
    expect(logger.checkLevel('info')).toBe('info');
    expect(logger.checkLevel('test')).toBe('test');
    expect(logger.checkLevel('warn')).toBe('warn');
    expect(logger.checkLevel('error')).toBe('error');
    expect(logger.checkLevel('env')).toBe('env');

    new Arguments({ PPD_LOG_LEVEL_TYPE: 'info' }, true);
    expect(logger.checkLevel(2)).toBe(false);
    expect(logger.checkLevel(3)).toBe('info');
  });

  test('makeLog', () => {
    const now = dayjs();
    const nowFormated = now.format('HH:mm:ss.SSS');

    expect(logger.makeLog({ level: 'info', levelIndent: 0, text: 'text', now: now })).toEqual([
      [
        [`${nowFormated} - info   `, 'sane'],
        ['text', 'info'],
      ],
    ]);

    expect(logger.makeLog({ level: 'info', levelIndent: 1, text: 'text', now: now })).toEqual([
      [
        [`${nowFormated} - info   |  `, 'sane'],
        ['text', 'info'],
      ],
    ]);

    expect(logger.makeLog({ level: 'info', levelIndent: 2, text: 'text', now: now })).toEqual([
      [
        [`${nowFormated} - info   |  |  `, 'sane'],
        ['text', 'info'],
      ],
    ]);

    expect(logger.makeLog({ level: 'info', levelIndent: 1, text: 'text', now: now, extendInfo: true })).toEqual([
      [
        [`                      |  `, 'sane'],
        ['text', 'info'],
      ],
    ]);

    expect(logger.makeLog({ level: 'error', levelIndent: 1, text: 'text', now: now, extendInfo: true })).toEqual([
      [
        [`${nowFormated} - error  |  `, 'error'],
        ['text', 'error'],
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true }, true);
    expect(logger.makeLog({ level: 'info', levelIndent: 1, text: 'text', now: now })).toEqual([
      [
        [`${nowFormated} - info   |  `, 'sane'],
        ['text', 'info'],
      ],
    ]);

    // Breadcrumbs
    new Arguments({ PPD_LOG_EXTEND: true }, true);
    logger.bindData({ testSource: { breadcrumbs: [] } });
    expect(logger.makeLog({ level: 'info', levelIndent: 1, text: 'text', now: now })).toEqual([
      [
        [`${nowFormated} - info   |  `, 'sane'],
        ['text', 'info'],
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true }, true);
    logger.bindData({ testSource: { breadcrumbs: ['foo.runTest[0]', 'hee'] } });
    expect(logger.makeLog({ level: 'info', levelIndent: 1, text: 'text', now: now })).toEqual([
      [
        [`${nowFormated} - info   |  `, 'sane'],
        ['text', 'info'],
      ],
      [
        ['                      |  ', 'sane'],
        ['👣[foo.runTest[0] -> hee]', 'info'],
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true }, true);
    logger.bindData({ testSource: { breadcrumbs: ['foo.runTest[0]', 'hee'] } });
    expect(logger.makeLog({ level: 'info', levelIndent: 1, text: 'text', now: now, extendInfo: true })).toEqual([
      [
        [`                      |  `, 'sane'],
        ['text', 'info'],
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true }, true);
    logger.bindData({ testSource: { breadcrumbs: ['foo.runTest[0]', 'hee'] } });
    expect(logger.makeLog({ level: 'raw', levelIndent: 1, text: 'text', now: now })).toEqual([
      [
        [`${nowFormated} - raw    |  `, 'sane'],
        ['text', 'raw'],
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true }, true);
    logger.bindData({ testSource: { breadcrumbs: ['foo.runTest[0]', 'hee'] } });
    expect(logger.makeLog({ level: 'error', levelIndent: 1, text: 'text', now: now })).toEqual([
      [
        [`${nowFormated} - error  |  `, 'error'],
        ['text', 'error'],
      ],
      [[`${nowFormated} - error  foo.runTest[0]`, 'error']],
      [[`${nowFormated} - error  |  hee`, 'error']],
    ]);

    new Arguments({ PPD_LOG_EXTEND: false }, true);
    logger.bindData({ testSource: { breadcrumbs: ['foo.runTest[0]', 'hee'] } });
    expect(logger.makeLog({ level: 'info', levelIndent: 1, text: 'text', now: now })).toEqual([
      [
        [`${nowFormated} - info   |  `, 'sane'],
        ['text', 'info'],
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true }, true);
    logger.bindData({ testSource: { breadcrumbs: ['foo.runTest[0]', 'hee'] } });
    expect(
      logger.makeLog({
        level: 'error',
        levelIndent: 1,
        text: 'text',
        now: now,
        funcFile: 'funcFile',
        testFile: 'testFile',
      }),
    ).toEqual([
      [
        [`${nowFormated} - error  |  `, 'error'],
        ['text', 'error'],
      ],
      [[`${nowFormated} - error  foo.runTest[0]`, 'error']],
      [[`${nowFormated} - error  |  hee`, 'error']],
      [[`${nowFormated} - error  |  [testFile]`, 'error']],
      [[`${nowFormated} - error  |  [funcFile]`, 'error']],
    ]);
  });
});
