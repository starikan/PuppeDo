/* eslint-disable no-new */
import fs from 'fs';
import path from 'path';

import { Log } from '../src/Log';
import { Arguments } from '../src/Arguments';
import { getNowDateTime } from '../src/Helpers';
import { Environment } from '../src/Environment';
import { Outputs, OutputsLatest } from '../src/global.d';
import { consoleLog, fileLog } from '../src/Loggers/Exporters';
import { formatterEntry } from '../src/Loggers/Formatters';

const outputFolder = '.temp';
const [folder, folderLatest] = [path.join(outputFolder, 'folder'), path.join(outputFolder, 'folderLatest')];
const { envsId } = new Environment().createEnv();
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
  describe('Write into console', () => {
    beforeEach(() => {
      console.log = jest.fn();
    });

    test('Console with colorization', () => {
      consoleLog([
        [
          { text: 'info ', textColor: 'sane', backgroundColor: 'sane' },
          { text: 'text', textColor: 'info', backgroundColor: 'sane' },
        ],
      ]);
      expect(console.log).toHaveBeenCalledWith('info \u001b[36mtext\u001b[0m');
    });

    test('Console with default colorization', () => {
      consoleLog([
        [
          { text: 'info ', textColor: 'sane', backgroundColor: 'sane' },
          { text: 'text', textColor: 'sane', backgroundColor: 'sane' },
        ],
      ]);
      expect(console.log).toHaveBeenCalledWith('info text');
    });

    test('Console with background colorization default', () => {
      consoleLog([
        [
          { text: 'info ', textColor: 'sane', backgroundColor: 'sane' },
          { text: 'text', textColor: 'sane', backgroundColor: 'sane' },
        ],
      ]);
      expect(console.log).toHaveBeenCalledWith('info text');
    });

    test('Console with background colorization exist color', () => {
      consoleLog([
        [
          { text: 'info ', textColor: 'sane', backgroundColor: 'redBackground' },
          { text: 'text', textColor: 'sane', backgroundColor: 'redBackground' },
        ],
      ]);
      expect(console.log).toHaveBeenCalledWith('\u001b[41minfo \u001b[0m\u001b[41mtext\u001b[0m');
    });

    test('Console multiline', () => {
      consoleLog([
        [
          { text: 'info ', textColor: 'sane', backgroundColor: 'sane' },
          { text: 'text', textColor: 'sane', backgroundColor: 'sane' },
        ],
        [
          { text: 'info', textColor: 'sane', backgroundColor: 'sane' },
          { text: 'text', textColor: 'sane', backgroundColor: 'sane' },
        ],
      ]);
      expect(console.log).toHaveBeenCalledWith('info text');
      expect(console.log).toHaveBeenCalledWith('info text');
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
            { text: 'info ', textColor: 'sane', backgroundColor: 'sane' },
            { text: 'text', textColor: 'info', backgroundColor: 'sane' },
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
            { text: 'info ', textColor: 'sane', backgroundColor: 'sane' },
            { text: 'text', textColor: 'info', backgroundColor: 'sane' },
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
            { text: '', textColor: 'sane', backgroundColor: 'sane' },
            { text: 'text', textColor: 'info', backgroundColor: 'sane' },
          ],
        ],
        'output.log',
      );
      expect(fs.readFileSync(path.join(folder, 'output.log')).toString()).toBe('text\n');
    });
  });

  test('checkLevel', () => {
    expect(Log.checkLevel('raw')).toBe(true);
    expect(Log.checkLevel('timer')).toBe(true);
    expect(Log.checkLevel('debug')).toBe(true);
    expect(Log.checkLevel('info')).toBe(true);
    expect(Log.checkLevel('test')).toBe(true);
    expect(Log.checkLevel('warn')).toBe(true);
    expect(Log.checkLevel('error')).toBe(true);
    expect(Log.checkLevel('env')).toBe(true);

    new Arguments({ PPD_LOG_LEVEL_TYPE_IGNORE: ['info', 'debug', 'env'] }, {}, true);
    expect(Log.checkLevel('raw')).toBe(true);
    expect(Log.checkLevel('timer')).toBe(true);
    expect(Log.checkLevel('debug')).toBe(false);
    expect(Log.checkLevel('info')).toBe(false);
    expect(Log.checkLevel('test')).toBe(true);
    expect(Log.checkLevel('warn')).toBe(true);
    expect(Log.checkLevel('error')).toBe(true);
    expect(Log.checkLevel('env')).toBe(false);
  });

  test('formatterEntry', async () => {
    const time = new Date();
    const nowFormated = getNowDateTime(time, 'HH:mm:ss.SSS');
    new Arguments({ PPD_LOG_INDENT_LENGTH: 2 }, {}, true);

    expect(await formatterEntry({ level: 'info', levelIndent: 0, text: 'text', time, stepId: '' }, {})).toEqual([
      [
        { text: `${nowFormated} - info   `, textColor: 'sane', backgroundColor: 'sane' },
        { text: 'text', textColor: 'info', backgroundColor: 'sane' },
      ],
    ]);

    expect(await formatterEntry({ level: 'info', levelIndent: 1, text: 'text', time, stepId: '' }, {})).toEqual([
      [
        { text: `${nowFormated} - info   | `, textColor: 'sane', backgroundColor: 'sane' },
        { text: 'text', textColor: 'info', backgroundColor: 'sane' },
      ],
    ]);

    expect(await formatterEntry({ level: 'info', levelIndent: 2, text: 'text', time, stepId: '' }, {})).toEqual([
      [
        { text: `${nowFormated} - info   | | `, textColor: 'sane', backgroundColor: 'sane' },
        { text: 'text', textColor: 'info', backgroundColor: 'sane' },
      ],
    ]);

    expect(
      await formatterEntry(
        {
          level: 'info',
          levelIndent: 1,
          text: 'text',
          time,
          funcFile: '',
          testFile: '',
          extendInfo: true,
          stepId: '',
        },
        {},
      ),
    ).toEqual([
      [
        { text: '                      | ', textColor: 'sane', backgroundColor: 'sane' },
        { text: 'text', textColor: 'info', backgroundColor: 'sane' },
      ],
    ]);

    expect(
      await formatterEntry(
        {
          level: 'error',
          levelIndent: 1,
          text: 'text',
          time,
          funcFile: '',
          testFile: '',
          extendInfo: true,
          stepId: '',
        },
        {},
      ),
    ).toEqual([
      [
        { text: `${nowFormated} - error  | `, textColor: 'error', backgroundColor: 'sane' },
        { text: 'text', textColor: 'error', backgroundColor: 'sane' },
      ],
    ]);

    expect(
      await formatterEntry(
        {
          level: 'info',
          levelIndent: 1,
          text: 'text',
          time,
          funcFile: '',
          testFile: '',
          extendInfo: true,
          screenshots: [],
          stepId: '',
        },
        {},
      ),
    ).toEqual([
      [
        { text: '                      | ', textColor: 'sane', backgroundColor: 'sane' },
        { text: 'text', textColor: 'info', backgroundColor: 'sane' },
      ],
    ]);

    expect(
      await formatterEntry(
        {
          level: 'info',
          levelIndent: 1,
          text: 'text',
          time,
          funcFile: '',
          testFile: '',
          extendInfo: true,
          screenshots: ['foo', 'bar'],
          stepId: '',
        },
        {},
      ),
    ).toEqual([
      [
        { text: '                      | ', textColor: 'sane', backgroundColor: 'sane' },
        { text: 'text', textColor: 'info', backgroundColor: 'sane' },
      ],
      [
        { text: `${nowFormated} - info   |  `, textColor: 'sane', backgroundColor: 'sane' },
        { text: '🖼 screenshot: [foo]', textColor: 'info', backgroundColor: 'sane' },
      ],
      [
        { text: `${nowFormated} - info   |  `, textColor: 'sane', backgroundColor: 'sane' },
        { text: '🖼 screenshot: [bar]', textColor: 'info', backgroundColor: 'sane' },
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_INDENT_LENGTH: 2 }, {}, true);
    expect(await formatterEntry({ level: 'info', levelIndent: 1, text: 'text', time, stepId: '' }, {})).toEqual([
      [
        { text: `${nowFormated} - info   | `, textColor: 'sane', backgroundColor: 'sane' },
        { text: 'text', textColor: 'info', backgroundColor: 'sane' },
      ],
    ]);

    // Breadcrumbs
    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_INDENT_LENGTH: 2 }, {}, true);
    expect(
      await formatterEntry({ level: 'info', levelIndent: 1, text: 'text', time, breadcrumbs: [], stepId: '' }, {}),
    ).toEqual([
      [
        { text: `${nowFormated} - info   | `, textColor: 'sane', backgroundColor: 'sane' },
        { text: 'text', textColor: 'info', backgroundColor: 'sane' },
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_INDENT_LENGTH: 2 }, {}, true);
    expect(
      await formatterEntry(
        {
          level: 'info',
          levelIndent: 1,
          text: 'text',
          time,
          breadcrumbs: ['foo.runTest[0]', 'hee'],
          stepId: '',
        },
        {},
      ),
    ).toEqual([
      [
        { text: `${nowFormated} - info   | `, textColor: 'sane', backgroundColor: 'sane' },
        { text: 'text', textColor: 'info', backgroundColor: 'sane' },
      ],
      [
        { text: '                      |  ', textColor: 'sane', backgroundColor: 'sane' },
        { text: '👣[foo.runTest[0] -> hee]', textColor: 'info', backgroundColor: 'sane' },
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_INDENT_LENGTH: 2 }, {}, true);
    expect(
      await formatterEntry(
        {
          level: 'info',
          levelIndent: 1,
          text: 'text',
          time,
          funcFile: '',
          testFile: '',
          extendInfo: true,
          breadcrumbs: ['foo.runTest[0]', 'hee'],
          stepId: '',
        },
        {},
      ),
    ).toEqual([
      [
        { text: '                      | ', textColor: 'sane', backgroundColor: 'sane' },
        { text: 'text', textColor: 'info', backgroundColor: 'sane' },
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_INDENT_LENGTH: 2 }, {}, true);
    expect(
      await formatterEntry(
        {
          level: 'raw',
          levelIndent: 1,
          text: 'text',
          time,
          breadcrumbs: ['foo.runTest[0]', 'hee'],
          stepId: '',
        },
        {},
      ),
    ).toEqual([
      [
        { text: `${nowFormated} - raw    | `, textColor: 'sane', backgroundColor: 'sane' },
        { text: 'text', textColor: 'sane', backgroundColor: 'sane' },
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_INDENT_LENGTH: 2 }, {}, true);
    expect(
      await formatterEntry(
        {
          level: 'error',
          levelIndent: 1,
          text: 'text',
          time,
          breadcrumbs: ['foo.runTest[0]', 'hee'],
          stepId: '',
        },
        {},
      ),
    ).toEqual([
      [
        { text: `${nowFormated} - error  | `, textColor: 'error', backgroundColor: 'sane' },
        { text: 'text', textColor: 'error', backgroundColor: 'sane' },
      ],
      [{ text: `${nowFormated} - error  |  foo.runTest[0]`, textColor: 'error', backgroundColor: 'sane' }],
      [{ text: `${nowFormated} - error  |     hee`, textColor: 'error', backgroundColor: 'sane' }],
      [
        { text: `${nowFormated} - error  |  `, textColor: 'error', backgroundColor: 'sane' },
        {
          text: '=============================================================================================',
          textColor: 'error',
          backgroundColor: 'sane',
        },
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: false, PPD_LOG_INDENT_LENGTH: 2 }, {}, true);
    expect(
      await formatterEntry(
        {
          level: 'info',
          levelIndent: 1,
          text: 'text',
          time,
          breadcrumbs: ['foo.runTest[0]', 'hee'],
          stepId: '',
        },
        {},
      ),
    ).toEqual([
      [
        { text: `${nowFormated} - info   | `, textColor: 'sane', backgroundColor: 'sane' },
        { text: 'text', textColor: 'info', backgroundColor: 'sane' },
      ],
    ]);

    new Arguments({ PPD_LOG_EXTEND: true, PPD_LOG_INDENT_LENGTH: 2 }, {}, true);
    const funcFile = path.resolve('funcFile');
    const testFile = path.resolve('testFile');
    expect(
      await formatterEntry(
        {
          level: 'error',
          levelIndent: 1,
          text: 'text',
          time,
          funcFile: 'funcFile',
          testFile: 'testFile',
          breadcrumbs: ['foo.runTest[0]', 'hee'],
          stepId: '',
        },
        {},
      ),
    ).toEqual([
      [
        { text: `${nowFormated} - error  | `, textColor: 'error', backgroundColor: 'sane' },
        { text: 'text', textColor: 'error', backgroundColor: 'sane' },
      ],
      [{ text: `${nowFormated} - error  |  foo.runTest[0]`, textColor: 'error', backgroundColor: 'sane' }],
      [{ text: `${nowFormated} - error  |     hee`, textColor: 'error', backgroundColor: 'sane' }],
      [{ text: `${nowFormated} - error  |  (file:///${testFile})`, textColor: 'error', backgroundColor: 'sane' }],
      [{ text: `${nowFormated} - error  |  (file:///${funcFile})`, textColor: 'error', backgroundColor: 'sane' }],
      [
        { text: `${nowFormated} - error  |  `, textColor: 'error', backgroundColor: 'sane' },
        {
          text: '=============================================================================================',
          textColor: 'error',
          backgroundColor: 'sane',
        },
      ],
    ]);

    // describe('Repeat in formatterEntry', () => {
    // logger.bindOptions({ testArgs: { repeat: 2 } });
    // expect(await formatterEntry({level:'info', levelIndent: 1, text: 'text', now)).toEqual([
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

    // expect(await formatterEntry({level:'error', levelIndent: 0, text: 'text', now)).toEqual([
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

    // expect(await formatterEntry({level:'info', levelIndent: 1, text: 'text', now, null, null, true, [], null, 'red', 'red')).toEqual([
    //   [
    //     { text: '                      | ', textColor: 'sane' },
    //     { text: 'text', textColor: 'red', backgroundColor: 'redBackground' },
    //   ],
    // ]);
  });

  // describe('log', () => {
  //   test('log', async () => {
  //     new Arguments({ PPD_LOG_LEVEL_TYPE: 'info' },{}, true);
  //     expect(await logger.log({ level: 'raw' })).toBeFalsy();

  //     new Arguments({ PPD_LOG_LEVEL_NESTED: 1 },{}, true);
  //     expect(await logger.log({ levelIndent: 2 })).toBeFalsy();

  //     new Arguments({ PPD_LOG_DISABLED: true },{}, true);
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
