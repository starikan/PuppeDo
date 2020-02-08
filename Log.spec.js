const _ = require('lodash');
const dayjs = require('dayjs');
// const jest = require('jest');

const Log = require('./Log');
const { Arguments } = require('./Arguments');

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

  it('consoleLog', () => {
    console.log = jest.fn();
    logger.consoleLog([
      [
        ['info ', 'sane'],
        ['text', 'info'],
      ],
    ]);
    expect(console.log).toHaveBeenCalledWith('\u001b[0minfo \u001b[0m\u001b[36mtext\u001b[0m');

    console.log = jest.fn();
    logger.consoleLog([[['info ', 'sane'], ['text']]]);
    expect(console.log).toHaveBeenCalledWith('\u001b[0minfo \u001b[0m\u001b[0mtext\u001b[0m');
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
