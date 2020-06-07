/* eslint-disable no-new */
import fs from 'fs';
import path from 'path';

import dayjs from 'dayjs';

import Log from '../src/Log';
import Arguments from '../src/Arguments';

const clearFiles = (fileName: string) => {
  const [folder, folderLatest] = [path.join('.temp', 'folder'), path.join('.temp', 'folderLatest')];
  if (fs.existsSync(path.join(folder, fileName))) {
    fs.unlinkSync(path.join(folder, fileName));
  }
  if (fs.existsSync(path.join(folderLatest, fileName))) {
    fs.unlinkSync(path.join(folderLatest, fileName));
  }
};

describe('Log', () => {
  let logger: Log;

  beforeEach(() => {
    logger = new Log('');
  });

  test('Constructor', () => {
    expect(logger.envs).toBeDefined();
    expect(logger.socket).toBeDefined();
    expect(logger.envsId).toBeDefined();
    expect(logger.binded).toBeDefined();
  });

  describe('Write into console', () => {
    beforeEach(() => {
      // eslint-disable-next-line no-console
      console.log = jest.fn();
    });

    test('Console with colorization', () => {
      Log.consoleLog([
        [
          ['info ', 'sane'],
          ['text', 'info'],
        ],
      ]);
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('\u001b[0minfo \u001b[0m\u001b[36mtext\u001b[0m');
    });

    test('Console with default colorization', () => {
      Log.consoleLog([[['info ', 'sane'], ['text']]]);
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('\u001b[0minfo \u001b[0m\u001b[0mtext\u001b[0m');
    });

    test('Console multiline', () => {
      Log.consoleLog([
        [['info '], ['text']],
        [['info '], ['text']],
      ]);
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('\u001b[0minfo \u001b[0m\u001b[0mtext\u001b[0m');
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('\u001b[0minfo \u001b[0m\u001b[0mtext\u001b[0m');
    });
  });

  describe('Write log into files', () => {
    const [folder, folderLatest] = [path.join('.temp', 'folder'), path.join('.temp', 'folderLatest')];

    beforeAll(() => {
      if (!fs.existsSync('.temp')) {
        fs.mkdirSync('.temp');
      }
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
      if (!fs.existsSync(folderLatest)) {
        fs.mkdirSync(folderLatest);
      }
    });

    test('Should thrown error if no folder to output', () => {
      expect(() => logger.fileLog()).toThrow(new Error('There is no output folder'));
      logger.envs.output = { folder };
      expect(() => logger.fileLog()).toThrow(new Error('There is no output folder'));
      logger.envs.output = { folderLatest };
      expect(() => logger.fileLog()).toThrow(new Error('There is no output folder'));
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
    // logger.bindData('foo');
    // expect(logger.binded).toEqual({ foo: 'bar', gii: 'huu' });
  });

  test('checkLevel', () => {
    expect(Log.checkLevel(0)).toBe('raw');
    expect(Log.checkLevel(1)).toBe('timer');
    expect(Log.checkLevel(2)).toBe('debug');
    expect(Log.checkLevel(3)).toBe('info');
    expect(Log.checkLevel(4)).toBe('test');
    expect(Log.checkLevel(5)).toBe('warn');
    expect(Log.checkLevel(6)).toBe('error');
    expect(Log.checkLevel(7)).toBe('env');
    expect(Log.checkLevel('raw')).toBe('raw');
    expect(Log.checkLevel('timer')).toBe('timer');
    expect(Log.checkLevel('debug')).toBe('debug');
    expect(Log.checkLevel('info')).toBe('info');
    expect(Log.checkLevel('test')).toBe('test');
    expect(Log.checkLevel('warn')).toBe('warn');
    expect(Log.checkLevel('error')).toBe('error');
    expect(Log.checkLevel('env')).toBe('env');

    new Arguments({ PPD_LOG_LEVEL_TYPE: 'info' }, true);
    expect(Log.checkLevel(2)).toBe('');
    expect(Log.checkLevel(3)).toBe('info');
  });

  test('makeLog', () => {
    const now = dayjs();
    const nowFormated = now.format('HH:mm:ss.SSS');

    expect(logger.makeLog('info', 0, 'text', now)).toEqual([
      [
        [`${nowFormated} - info   `, 'sane'],
        ['text', 'info'],
      ],
    ]);

    expect(logger.makeLog('info', 1, 'text', now)).toEqual([
      [
        [`${nowFormated} - info   |  `, 'sane'],
        ['text', 'info'],
      ],
    ]);

    expect(logger.makeLog('info', 2, 'text', now)).toEqual([
      [
        [`${nowFormated} - info   |  |  `, 'sane'],
        ['text', 'info'],
      ],
    ]);

    expect(logger.makeLog('info', 1, 'text', now, null, null, true)).toEqual([
      [
        ['                      |  ', 'sane'],
        ['text', 'info'],
      ],
    ]);

    expect(logger.makeLog('error', 1, 'text', now, null, null, true)).toEqual([
      [
        [`${nowFormated} - error  |  `, 'error'],
        ['text', 'error'],
      ],
    ]);

    expect(logger.makeLog('info', 1, 'text', now, null, null, true, [])).toEqual([
      [
        ['                      |  ', 'sane'],
        ['text', 'info'],
      ],
    ]);

    expect(logger.makeLog('info', 1, 'text', now, null, null, true, ['foo', 'bar'])).toEqual([
      [
        ['                      |  ', 'sane'],
        ['text', 'info'],
      ],
      [
        [`${nowFormated} - info   |  `, 'sane'],
        ['🖼 screenshot: [foo]', 'info'],
      ],
      [
        [`${nowFormated} - info   |  `, 'sane'],
        ['🖼 screenshot: [bar]', 'info'],
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true }, true);
    expect(logger.makeLog('info', 1, 'text', now)).toEqual([
      [
        [`${nowFormated} - info   |  `, 'sane'],
        ['text', 'info'],
      ],
    ]);

    // Breadcrumbs
    new Arguments({ PPD_LOG_EXTEND: true }, true);
    logger.bindData({ testSource: { breadcrumbs: [] } });
    expect(logger.makeLog('info', 1, 'text', now)).toEqual([
      [
        [`${nowFormated} - info   |  `, 'sane'],
        ['text', 'info'],
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true }, true);
    logger.bindData({ testSource: { breadcrumbs: ['foo.runTest[0]', 'hee'] } });
    expect(logger.makeLog('info', 1, 'text', now)).toEqual([
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
    expect(logger.makeLog('info', 1, 'text', now, null, null, true)).toEqual([
      [
        ['                      |  ', 'sane'],
        ['text', 'info'],
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true }, true);
    logger.bindData({ testSource: { breadcrumbs: ['foo.runTest[0]', 'hee'] } });
    expect(logger.makeLog('raw', 1, 'text', now)).toEqual([
      [
        [`${nowFormated} - raw    |  `, 'sane'],
        ['text', 'raw'],
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true }, true);
    logger.bindData({ testSource: { breadcrumbs: ['foo.runTest[0]', 'hee'] } });
    expect(logger.makeLog('error', 1, 'text', now)).toEqual([
      [
        [`${nowFormated} - error  |  `, 'error'],
        ['text', 'error'],
      ],
      [[`${nowFormated} - error  |  foo.runTest[0]`, 'error']],
      [[`${nowFormated} - error  |     hee`, 'error']],
      [
        [`${nowFormated} - error  |  `, 'error'],
        ['=============================================================================================', 'error'],
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: false }, true);
    logger.bindData({ testSource: { breadcrumbs: ['foo.runTest[0]', 'hee'] } });
    expect(logger.makeLog('info', 1, 'text', now)).toEqual([
      [
        [`${nowFormated} - info   |  `, 'sane'],
        ['text', 'info'],
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true }, true);
    logger.bindData({ testSource: { breadcrumbs: ['foo.runTest[0]', 'hee'] } });
    const funcFile = path.resolve('funcFile');
    const testFile = path.resolve('testFile');
    expect(logger.makeLog('error', 1, 'text', now, 'funcFile', 'testFile')).toEqual([
      [
        [`${nowFormated} - error  |  `, 'error'],
        ['text', 'error'],
      ],
      [[`${nowFormated} - error  |  foo.runTest[0]`, 'error']],
      [[`${nowFormated} - error  |     hee`, 'error']],
      [[`${nowFormated} - error  |  (file:///${testFile})`, 'error']],
      [[`${nowFormated} - error  |  (file:///${funcFile})`, 'error']],
      [
        [`${nowFormated} - error  |  `, 'error'],
        ['=============================================================================================', 'error'],
      ],
    ]);
  });

  describe('log', () => {
    test('log', async () => {
      new Arguments({ PPD_LOG_LEVEL_TYPE: 'info' }, true);
      expect(await logger.log({ level: 'raw' })).toBeFalsy();

      new Arguments({ PPD_LOG_LEVEL_NESTED: 1 }, true);
      expect(await logger.log({ levelIndent: 2 })).toBeFalsy();

      new Arguments({ PPD_LOG_DISABLED: true }, true);
      expect(await logger.log({})).toBeFalsy();
    });
  });

  describe('saveScreenshot', () => {
    // let fs;

    beforeEach(() => {
      // fs = jest.genMockFromModule('fs');
      logger.envs = {};
      logger.envs.getActivePage = jest.fn(() => ({ screenshot: jest.fn() }));
      logger.envs.getActivePage.screenshot = jest.fn();
      logger.envs.getOutputsFolders = jest.fn(() => ({ folder: 'foo', folderLatest: 'foobar' }));
    });

    // test('should getOutputsFolders function to be called', async () => {
    //   await logger.screenshot.saveScreenshot();
    //   expect(logger.envs.getOutputsFolders).toHaveBeenCalled();
    // });

    // test('should return false with no arguments', async () => {
    //   expect(await logger.screenshot.saveScreenshot()).toBe(false);
    // });

    // test('should getActivePage function to be called', async () => {
    //   await logger.screenshot.saveScreenshot({ fullPage: true });
    //   // fs.existsSync = jest.fn(() => true);
    //   expect(logger.envs.getActivePage).toHaveBeenCalled();
    // });

    // test('should page.screenshot function to be called', async () => {
    //   await logger.saveScreenshot({fullPage: true});
    //   expect(logger.envs.getActivePage.screenshot).toHaveBeenCalled();
    // });
  });

  describe('getScreenshots', () => {
    test('getScreenshots', async () => {
      // logger.getOutputsFolders = () => ({
      //   folder: path.join('.temp', 'folder'),
      //   folderLatest: path.join('.temp', 'folderLatest'),
      // });
      // logger.getActivePage = () => ({
      //   page: {
      //     $: () => ({ screenshot: () => {} }),
      //     screenshot: () => {},
      //   },
      // });
      // const element = {
      //   screenshot: () => {},
      // };
      // debugger
      // expect(await logger.getScreenshots({}, false, true)).toEqual([]);
      // expect(await logger.getScreenshots('', {}, true)).toEqual([]);
    });
  });
});
