/* eslint-disable no-new */
import fs from 'fs';
import path from 'path';

import { checkLevel } from '../src/Log';
import { Arguments } from '../src/Arguments';
import { getNowDateTime } from '../src/Helpers';
import { Environment } from '../src/Environment';
import { Outputs, OutputsLatest } from '../src/global.d';
import { consoleLog, fileLog } from '../src/Loggers/Exporters';
import { makeLog } from '../src/Loggers/Formatters';

const outputFolder = '.temp';
const [folder, folderLatest] = [path.join(outputFolder, 'folder'), path.join(outputFolder, 'folderLatest')];
const { logger, envsId } = new Environment().createEnv();
new Environment().getOutput = (): OutputsLatest & Outputs => ({
  folder,
  folderLatest,
  output: outputFolder,
});

const clearFiles = (fileName: string): void => {
  if (fs.existsSync(path.join(folder, fileName))) {
    fs.unlinkSync(path.join(folder, fileName));
  }
  if (fs.existsSync(path.join(folderLatest, fileName))) {
    fs.unlinkSync(path.join(folderLatest, fileName));
  }
};

describe('Log', () => {
  test('Constructor', () => {
    expect(logger.envsId).toBeDefined();
    expect(logger.envsId).toBeDefined();
    expect(logger.options).toBeDefined();
  });

  describe('Write into console', () => {
    beforeEach(() => {
      console.log = jest.fn();
    });

    test('Console with colorization', () => {
      consoleLog([
        [
          { text: 'info ', textColor: 'sane' },
          { text: 'text', textColor: 'info' },
        ],
      ]);
      expect(console.log).toHaveBeenCalledWith('\u001b[0minfo \u001b[0m\u001b[36mtext\u001b[0m');
    });

    test('Console with default colorization', () => {
      consoleLog([
        [
          { text: 'info ', textColor: 'sane' },
          { text: 'text', textColor: 'sane' },
        ],
      ]);
      expect(console.log).toHaveBeenCalledWith('\u001b[0minfo \u001b[0m\u001b[0mtext\u001b[0m');
    });

    test('Console with background colorization default', () => {
      consoleLog([
        [
          { text: 'info ', textColor: 'sane', backgroundColor: 'sane' },
          { text: 'text', textColor: 'sane', backgroundColor: 'sane' },
        ],
      ]);
      expect(console.log).toHaveBeenCalledWith('\u001b[0minfo \u001b[0m\u001b[0mtext\u001b[0m');
    });

    test('Console with background colorization exist color', () => {
      consoleLog([
        [
          { text: 'info ', textColor: 'sane', backgroundColor: 'redBackground' },
          { text: 'text', textColor: 'sane', backgroundColor: 'redBackground' },
        ],
      ]);
      expect(console.log).toHaveBeenCalledWith(
        '\u001b[41m\u001b[0minfo \u001b[0m\u001b[0m\u001b[41m\u001b[0mtext\u001b[0m\u001b[0m',
      );
    });

    test('Console multiline', () => {
      consoleLog([
        [
          { text: 'info ', textColor: 'sane' },
          { text: 'text', textColor: 'sane' },
        ],
        [
          { text: 'info', textColor: 'sane' },
          { text: 'text', textColor: 'sane' },
        ],
      ]);
      expect(console.log).toHaveBeenCalledWith('\u001b[0minfo \u001b[0m\u001b[0mtext\u001b[0m');
      expect(console.log).toHaveBeenCalledWith('\u001b[0minfo\u001b[0m\u001b[0mtext\u001b[0m');
    });
  });

  describe('Write log into files', () => {
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

    test('Simple output to default file', () => {
      clearFiles('output.log');
      fileLog(
        envsId,
        [
          [
            { text: 'info ', textColor: 'sane' },
            { text: 'text', textColor: 'info' },
          ],
        ],
        'output.log',
      );
      expect(fs.readFileSync(path.join(folder, 'output.log')).toString()).toBe('info text\n');
      expect(fs.readFileSync(path.join(folderLatest, 'output.log')).toString()).toBe('info text\n');
    });
    test('Write to optional file', () => {
      clearFiles('output_another.log');
      fileLog(
        envsId,
        [
          [
            { text: 'info ', textColor: 'sane' },
            { text: 'text', textColor: 'info' },
          ],
        ],
        'output_another.log',
      );
      expect(fs.readFileSync(path.join(folder, 'output_another.log')).toString()).toBe('info text\n');
      expect(fs.readFileSync(path.join(folderLatest, 'output_another.log')).toString()).toBe('info text\n');
    });
    test('Not standart input', () => {
      clearFiles('output.log');
      fileLog(envsId, 'foo', 'output.log');
      expect(fs.readFileSync(path.join(folder, 'output.log')).toString()).toBe('foo\n');

      clearFiles('output.log');
      fileLog(
        envsId,
        [
          [
            { text: '', textColor: 'sane' },
            { text: 'text', textColor: 'info' },
          ],
        ],
        'output.log',
      );
      expect(fs.readFileSync(path.join(folder, 'output.log')).toString()).toBe('text\n');
    });
  });

  test('bindData', () => {
    logger.bindData({ stdOut: true });
    expect(logger.options).toEqual({ stdOut: true });
  });

  test('checkLevel', () => {
    expect(checkLevel('raw')).toBe('raw');
    expect(checkLevel('timer')).toBe('timer');
    expect(checkLevel('debug')).toBe('debug');
    expect(checkLevel('info')).toBe('info');
    expect(checkLevel('test')).toBe('test');
    expect(checkLevel('warn')).toBe('warn');
    expect(checkLevel('error')).toBe('error');
    expect(checkLevel('env')).toBe('env');

    new Arguments({ PPD_LOG_LEVEL_TYPE_IGNORE: ['info', 'debug', 'env'] }, true);
    expect(checkLevel('raw')).toBe('raw');
    expect(checkLevel('timer')).toBe('timer');
    expect(checkLevel('debug')).toBe(null);
    expect(checkLevel('info')).toBe(null);
    expect(checkLevel('test')).toBe('test');
    expect(checkLevel('warn')).toBe('warn');
    expect(checkLevel('error')).toBe('error');
    expect(checkLevel('env')).toBe(null);
  });

  test('makeLog', () => {
    const time = new Date();
    const nowFormated = getNowDateTime(time, 'HH:mm:ss.SSS');
    new Arguments({ PPD_LOG_INDENT_LENGTH: 2 }, true);

    expect(makeLog({ level: 'info', levelIndent: 0, text: 'text', time, stepId: '' })).toEqual([
      [
        { text: `${nowFormated} - info   `, textColor: 'sane' },
        { text: 'text', textColor: 'info' },
      ],
    ]);

    expect(makeLog({ level: 'info', levelIndent: 1, text: 'text', time, stepId: '' })).toEqual([
      [
        { text: `${nowFormated} - info   | `, textColor: 'sane' },
        { text: 'text', textColor: 'info' },
      ],
    ]);

    expect(makeLog({ level: 'info', levelIndent: 2, text: 'text', time, stepId: '' })).toEqual([
      [
        { text: `${nowFormated} - info   | | `, textColor: 'sane' },
        { text: 'text', textColor: 'info' },
      ],
    ]);

    expect(
      makeLog({
        level: 'info',
        levelIndent: 1,
        text: 'text',
        time,
        funcFile: '',
        testFile: null,
        extendInfo: true,
        stepId: '',
      }),
    ).toEqual([
      [
        { text: '                      | ', textColor: 'sane' },
        { text: 'text', textColor: 'info' },
      ],
    ]);

    expect(
      makeLog({
        level: 'error',
        levelIndent: 1,
        text: 'text',
        time,
        funcFile: null,
        testFile: null,
        extendInfo: true,
        stepId: '',
      }),
    ).toEqual([
      [
        { text: `${nowFormated} - error  | `, textColor: 'error' },
        { text: 'text', textColor: 'error' },
      ],
    ]);

    expect(
      makeLog({
        level: 'info',
        levelIndent: 1,
        text: 'text',
        time,
        funcFile: null,
        testFile: null,
        extendInfo: true,
        screenshots: [],
        stepId: '',
      }),
    ).toEqual([
      [
        { text: '                      | ', textColor: 'sane' },
        { text: 'text', textColor: 'info' },
      ],
    ]);

    expect(
      makeLog({
        level: 'info',
        levelIndent: 1,
        text: 'text',
        time,
        funcFile: null,
        testFile: null,
        extendInfo: true,
        screenshots: ['foo', 'bar'],
        stepId: '',
      }),
    ).toEqual([
      [
        { text: '                      | ', textColor: 'sane' },
        { text: 'text', textColor: 'info' },
      ],
      [
        { text: `${nowFormated} - info   |  `, textColor: 'sane' },
        { text: '🖼 screenshot: [foo]', textColor: 'info' },
      ],
      [
        { text: `${nowFormated} - info   |  `, textColor: 'sane' },
        { text: '🖼 screenshot: [bar]', textColor: 'info' },
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_INDENT_LENGTH: 2 }, true);
    expect(makeLog({ level: 'info', levelIndent: 1, text: 'text', time, stepId: '' })).toEqual([
      [
        { text: `${nowFormated} - info   | `, textColor: 'sane' },
        { text: 'text', textColor: 'info' },
      ],
    ]);

    // Breadcrumbs
    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_INDENT_LENGTH: 2 }, true);
    expect(makeLog({ level: 'info', levelIndent: 1, text: 'text', time, breadcrumbs: [], stepId: '' })).toEqual([
      [
        { text: `${nowFormated} - info   | `, textColor: 'sane' },
        { text: 'text', textColor: 'info' },
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_INDENT_LENGTH: 2 }, true);
    expect(
      makeLog({
        level: 'info',
        levelIndent: 1,
        text: 'text',
        time,
        breadcrumbs: ['foo.runTest[0]', 'hee'],
        stepId: '',
      }),
    ).toEqual([
      [
        { text: `${nowFormated} - info   | `, textColor: 'sane' },
        { text: 'text', textColor: 'info' },
      ],
      [
        { text: '                      |  ', textColor: 'sane' },
        { text: '👣[foo.runTest[0] -> hee]', textColor: 'info' },
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_INDENT_LENGTH: 2 }, true);
    expect(
      makeLog({
        level: 'info',
        levelIndent: 1,
        text: 'text',
        time,
        funcFile: null,
        testFile: null,
        extendInfo: true,
        breadcrumbs: ['foo.runTest[0]', 'hee'],
        stepId: '',
      }),
    ).toEqual([
      [
        { text: '                      | ', textColor: 'sane' },
        { text: 'text', textColor: 'info' },
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_INDENT_LENGTH: 2 }, true);
    expect(
      makeLog({
        level: 'raw',
        levelIndent: 1,
        text: 'text',
        time,
        breadcrumbs: ['foo.runTest[0]', 'hee'],
        stepId: '',
      }),
    ).toEqual([
      [
        { text: `${nowFormated} - raw    | `, textColor: 'sane' },
        { text: 'text', textColor: 'raw' },
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_INDENT_LENGTH: 2 }, true);
    expect(
      makeLog({
        level: 'error',
        levelIndent: 1,
        text: 'text',
        time,
        breadcrumbs: ['foo.runTest[0]', 'hee'],
        stepId: '',
      }),
    ).toEqual([
      [
        { text: `${nowFormated} - error  | `, textColor: 'error' },
        { text: 'text', textColor: 'error' },
      ],
      [{ text: `${nowFormated} - error  |  foo.runTest[0]`, textColor: 'error' }],
      [{ text: `${nowFormated} - error  |     hee`, textColor: 'error' }],
      [
        { text: `${nowFormated} - error  |  `, textColor: 'error' },
        {
          text: '=============================================================================================',
          textColor: 'error',
        },
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: false, PPD_LOG_INDENT_LENGTH: 2 }, true);
    expect(
      makeLog({
        level: 'info',
        levelIndent: 1,
        text: 'text',
        time,
        breadcrumbs: ['foo.runTest[0]', 'hee'],
        stepId: '',
      }),
    ).toEqual([
      [
        { text: `${nowFormated} - info   | `, textColor: 'sane' },
        { text: 'text', textColor: 'info' },
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_INDENT_LENGTH: 2 }, true);
    const funcFile = path.resolve('funcFile');
    const testFile = path.resolve('testFile');
    expect(
      makeLog({
        level: 'error',
        levelIndent: 1,
        text: 'text',
        time,
        funcFile: 'funcFile',
        testFile: 'testFile',
        breadcrumbs: ['foo.runTest[0]', 'hee'],
        stepId: '',
      }),
    ).toEqual([
      [
        { text: `${nowFormated} - error  | `, textColor: 'error' },
        { text: 'text', textColor: 'error' },
      ],
      [{ text: `${nowFormated} - error  |  foo.runTest[0]`, textColor: 'error' }],
      [{ text: `${nowFormated} - error  |     hee`, textColor: 'error' }],
      [{ text: `${nowFormated} - error  |  (file:///${testFile})`, textColor: 'error' }],
      [{ text: `${nowFormated} - error  |  (file:///${funcFile})`, textColor: 'error' }],
      [
        { text: `${nowFormated} - error  |  `, textColor: 'error' },
        {
          text: '=============================================================================================',
          textColor: 'error',
        },
      ],
    ]);

    // describe('Repeat in makeLog', () => {
    // logger.bindData({ testArgs: { repeat: 2 } });
    // expect(makeLog({level:'info', levelIndent: 1, text: 'text', now)).toEqual([
    //   [
    //     { text: `${nowFormated} - info   |  `, textColor: 'sane' },
    //     { text: 'text', textColor: 'info' },
    //   ],
    //   [
    //     { text: '                      | ', textColor: 'sane' },
    //     { text: '👣[foo.runTest[0] -> hee]', textColor: 'info' },
    //   ],
    //   [
    //     { text: '                      | ', textColor: 'sane' },
    //     { text: '🔆 repeats left: 1', textColor: 'info' },
    //   ],
    // ]);
    // });

    // expect(makeLog({level:'error', levelIndent: 0, text: 'text', now)).toEqual([
    //   [
    //     { text: `${nowFormated} - error  `, textColor: 'error' },
    //     { text: 'text', textColor: 'error' },
    //   ],
    //   [{ text: `${nowFormated} - error  foo.runTest[0]`, textColor: 'error' }],
    //   [{ text: `${nowFormated} - error     hee`, textColor: 'error' }],
    //   [
    //     { text: `${nowFormated} - error  `, textColor: 'error' },
    //     {
    //       text: '================================================================================================',
    //       textColor: 'error',
    //     },
    //   ],
    //   [
    //     { text: '                      ', textColor: 'error' },
    //     { text: '', textColor: 'error' },
    //   ],
    //   [
    //     { text: '                      ', textColor: 'error' },
    //     {
    //       text: '================================================================================================',
    //       textColor: 'error',
    //     },
    //   ],
    //   [
    //     { text: '                      ', textColor: 'error' },
    //     { text: '', textColor: 'error' },
    //   ],
    // ]);

    // expect(makeLog({level:'info', levelIndent: 1, text: 'text', now, null, null, true, [], null, 'red', 'red')).toEqual([
    //   [
    //     { text: '                      | ', textColor: 'sane' },
    //     { text: 'text', textColor: 'red', backgroundColor: 'redBackground' },
    //   ],
    // ]);
  });

  // describe('log', () => {
  //   test('log', async () => {
  //     new Arguments({ PPD_LOG_LEVEL_TYPE: 'info' }, true);
  //     expect(await logger.log({ level: 'raw' })).toBeFalsy();

  //     new Arguments({ PPD_LOG_LEVEL_NESTED: 1 }, true);
  //     expect(await logger.log({ levelIndent: 2 })).toBeFalsy();

  //     new Arguments({ PPD_LOG_DISABLED: true }, true);
  //     expect(await logger.log({})).toBeFalsy();
  //   });
  // });

  describe('saveScreenshot', () => {
    // let fs;
    // beforeEach(() => {
    // fs = jest.genMockFromModule('fs');
    // logger.envs = {};
    // logger.envs.getActivePage = jest.fn(() => ({ screenshot: jest.fn() }));
    // logger.envs.getActivePage.screenshot = jest.fn();
    // logger.envs.getOutputsFolders = jest.fn(() => ({ folder: 'foo', folderLatest: 'foobar' }));
    // });
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
});
