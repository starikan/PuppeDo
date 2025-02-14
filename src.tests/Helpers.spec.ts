import { sleep, paintString, blankSocket, mergeObjects } from '../src/Helpers';

test('Helpers -> sleep', async () => {
  const start = process.hrtime.bigint();
  await sleep(20);
  const delay = process.hrtime.bigint() - start;
  expect(delay).toBeGreaterThanOrEqual(20);
});

test('Helpers -> paintString', () => {
  expect(paintString('*******')).toEqual('*******');

  expect(paintString('*******', 'sane')).toEqual('*******');
  expect(paintString('*******', 'black')).toEqual('\u001b[30m*******\u001b[0m');
  expect(paintString('*******', 'red')).toEqual('\u001b[31m*******\u001b[0m');
  expect(paintString('*******', 'green')).toEqual('\u001b[32m*******\u001b[0m');
  expect(paintString('*******', 'yellow')).toEqual('\u001b[33m*******\u001b[0m');
  expect(paintString('*******', 'blue')).toEqual('\u001b[34m*******\u001b[0m');
  expect(paintString('*******', 'magenta')).toEqual('\u001b[35m*******\u001b[0m');
  expect(paintString('*******', 'cyan')).toEqual('\u001b[36m*******\u001b[0m');
  expect(paintString('*******', 'white')).toEqual('\u001b[37m*******\u001b[0m');

  expect(paintString('*******', 'raw')).toEqual('*******');
  expect(paintString('*******', 'timer')).toEqual('*******');
  expect(paintString('*******', 'debug')).toEqual('*******');
  expect(paintString('*******', 'info')).toEqual('\u001b[36m*******\u001b[0m');
  expect(paintString('*******', 'test')).toEqual('\u001b[32m*******\u001b[0m');
  expect(paintString('*******', 'warn')).toEqual('\u001b[33m*******\u001b[0m');
  expect(paintString('*******', 'error')).toEqual('\u001b[31m*******\u001b[0m');
  expect(paintString('*******', 'trace')).toEqual('\u001b[36m*******\u001b[0m');
  expect(paintString('*******', 'env')).toEqual('\u001b[34m*******\u001b[0m');
});

test('Helpers -> blankSocket', () => {
  expect(Object.keys(blankSocket)).toEqual(['send', 'sendYAML']);
  expect(typeof blankSocket.send === 'function').toBe(true);
  expect(typeof blankSocket.sendYAML === 'function').toBe(true);
  expect(blankSocket.send()).toBeFalsy();
  // expect(blankSocket.sendYAML({ type: 'string', data: {}, envsId: 'string' })).toBeFalsy();
});

describe('Helpers.mergeObjects', () => {
  test('should merge simple objects', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 0, b: 3, c: 4 };
    const result = mergeObjects([obj1, obj2]);
    expect(result).toEqual({ a: 0, b: 3, c: 4 });
  });

  test('should merge nested objects', () => {
    const obj1 = { a: { x: 1 }, b: 2 };
    const obj2 = { a: { x: 0, y: 2 }, b: 2, c: 3 };
    const result = mergeObjects([obj1, obj2]);
    expect(result).toEqual({ a: { x: 0, y: 2 }, b: 2, c: 3 });
  });

  test('should merge arrays', () => {
    const obj1 = { a: [1, 2] };
    const obj2 = { a: [3, 4], b: 5 };
    const result = mergeObjects([obj1, obj2]);
    expect(result).toEqual({ a: [1, 2, 3, 4], b: 5 });
  });

  test('should handle null and undefined values', () => {
    const obj1 = { a: null, b: 2 };
    const obj2 = { a: 3, b: undefined };
    const result = mergeObjects([obj1, obj2]);
    expect(result).toEqual({ a: 3, b: 2 });
  });

  test('should handle empty objects', () => {
    const obj1 = {};
    const obj2 = { a: 1 };
    const result = mergeObjects([obj1, obj2]);
    expect(result).toEqual({ a: 1 });
  });

  test('should merge multiple objects', () => {
    const obj1: { a?: number; b?: number; c?: number } = { a: 1 };
    const obj2: { a?: number; b?: number; c?: number } = { a: 2, b: 2 };
    const obj3: { a?: number; b?: number; c?: number } = { c: 3 };
    const result = mergeObjects([obj1, obj2, obj3]);
    expect(result).toEqual({ a: 2, b: 2, c: 3 });
  });
});
