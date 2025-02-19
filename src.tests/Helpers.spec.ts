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
  test('should return an empty object if an empty array is passed', () => {
    const result = mergeObjects([]);
    expect(result).toEqual({});
  });

  test('should correctly merge simple objects', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 3, c: 4 };
    const result = mergeObjects([obj1, obj2]);
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  test('should correctly merge nested objects', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { c: 2 } };
    const result = mergeObjects([obj1, obj2]);
    expect(result).toEqual({ a: { b: 1, c: 2 } });
  });

  test('should merge arrays without deduplication when uniqueArray = false', () => {
    const obj1 = { arr: [1, 2, 3] };
    const obj2 = { arr: [3, 4, 1] };
    const result = mergeObjects([obj1, obj2], false);
    expect(result).toEqual({ arr: [1, 2, 3, 3, 4, 1] });
  });

  test('should merge arrays with deduplication when uniqueArray = true', () => {
    const obj1 = { arr: [1, 2, 3, 2] };
    const obj2 = { arr: [3, 4, 1] };
    const result = mergeObjects([obj1, obj2], true);
    expect(result).toEqual({ arr: [1, 2, 3, 4] });
  });

  test('should merge arrays containing primitives and objects without deduplication for objects', () => {
    const sharedObj = { key: 'value' };
    const obj1 = { arr: [1, sharedObj] };
    const obj2 = { arr: [1, { key: 'value' }, sharedObj] };

    // When uniqueArray = false – all elements are concatenated
    const resultUniqueFalse = mergeObjects([obj1, obj2], false);
    expect(resultUniqueFalse.arr).toEqual([1, sharedObj, 1, { key: 'value' }, sharedObj]);

    // When uniqueArray = true – primitives are deduplicated, objects remain
    const resultUniqueTrue = mergeObjects([obj1, obj2], true);
    expect(resultUniqueTrue.arr.length).toBe(4);
    expect(resultUniqueTrue.arr).toEqual([1, sharedObj, { key: 'value' }, sharedObj]);
  });

  test('should replace false (falsy) values of the target object with objects from the source for recursive merge', () => {
    const obj1 = { a: 0, b: false, c: '' };
    const obj2 = { a: { nested: 123 }, b: { nested: 456 }, c: { nested: 789 } };
    const result = mergeObjects([obj1, obj2]);
    expect(result).toEqual({
      a: { nested: 123 },
      b: { nested: 456 },
      c: { nested: 789 },
    });
  });

  test('should not overwrite a value if the source value is undefined', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: undefined };
    const result = mergeObjects([obj1, obj2]);
    expect(result).toEqual({ a: 1 });
  });

  test('should correctly merge arrays containing null with deduplication', () => {
    const obj1 = { arr: [null, 1, null] };
    const obj2 = { arr: [null, 1, 2] };
    const result = mergeObjects([obj1, obj2], true);
    expect(result).toEqual({ arr: [null, 1, 2] });
  });

  test('should correctly merge arrays with nested objects and primitives', () => {
    const obj1 = { a: { arr: [1, { b: 1 }] } };
    const obj2 = { a: { arr: [2, { b: 2 }] } };
    const result = mergeObjects([obj1, obj2], true);
    expect(result).toEqual({ a: { arr: [1, { b: 1 }, 2, { b: 2 }] } });
  });

  test('should preserve functions in arrays without deduplication', () => {
    const f1 = () => {};
    const f2 = () => {};
    const obj1 = { arr: [f1] };
    const obj2 = { arr: [f1, f2] };

    const resultFalse = mergeObjects([obj1, obj2], false);
    expect(resultFalse.arr).toEqual([f1, f1, f2]);

    const resultTrue = mergeObjects([obj1, obj2], true);
    expect(resultTrue.arr).toEqual([f1, f1, f2]);
  });
});
