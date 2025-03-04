import { sleep, paintString, blankSocket, mergeObjects, deepMergeField, getTimer } from '../src/Helpers';

test('Helpers.sleep', async () => {
  const start = process.hrtime.bigint();
  await sleep(20);
  const delay = process.hrtime.bigint() - start;
  expect(delay).toBeGreaterThanOrEqual(20);
});

test('Helpers.paintString', () => {
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

test('Helpers.blankSocket', () => {
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

  test('merging primitives – if primitives are passed, the last one is returned', () => {
    // The first element is not an array, so the result is initialized as {},
    // then deepMerge({}, 1) will return 1, and deepMerge(1, 2) will return 2.
    const result = mergeObjects([1, 2]);
    expect(result).toEqual(2);
  });

  test('merging when target is not an array, but source is an array', () => {
    // The first element is an object, so the result is initialized as {},
    // then deepMerge({}, [10, 20, 20]) will execute the "if (Array.isArray(source))"
    // branch with deduplication if uniqueArray = true.
    const result = mergeObjects([{ a: 'initial' }, [10, 20, 20]], true);
    expect(result).toEqual([10, 20]);
  });

  test('merging when target is an array, but source is an object', () => {
    // The first element is an array, so the result is initialized as [].
    // When merging deepMerge([], { a: 'value', b: undefined }) will hit the branch,
    // where target is overwritten with an empty object, since Array.isArray(target) === true.
    // The key 'b' with value undefined is skipped.
    const result = mergeObjects([[1, 2], { a: 'value', b: undefined }]);
    expect(result).toEqual({ a: 'value' });
  });

  test('merging when source has a key with undefined – it is skipped', () => {
    const result = mergeObjects([{ a: 1 }, { a: undefined, b: 2 }]);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test('merging nested arrays with deduplication of primitives', () => {
    // We check the case where two top-level arrays consisting of primitives are merged.
    const result = mergeObjects(
      [
        [1, 2, 2],
        [2, 3, 1],
      ],
      true,
    );
    expect(result).toEqual([1, 2, 3]);
  });

  test('merging nested objects when the target value has an incorrect type', () => {
    // If the target value has a "falsey" type (e.g., 0) and the source provides an object,
    // the target is replaced with an empty object and recursive merging is performed.
    const result = mergeObjects([{ a: 0 }, { a: { nested: 'x' } }]);
    expect(result).toEqual({ a: { nested: 'x' } });
  });

  test('merging nested structures – property that in target has an object value, but in source has an array value', () => {
    // When merging {a: 1} and {a: [2, 3]} should return the array from source, as source has a different type,
    // and in the "if (Array.isArray(source))" branch for target, which is not an array,
    // simply returns the array with merging and deduplication (if enabled).
    const result = mergeObjects([{ a: 1 }, { a: [2, 3] }]);
    expect(result).toEqual({ a: [2, 3] });
  });

  test('merging nested structures – property that in target has an array value, but in source has an object value', () => {
    // The first element is an array, so the result is initialized as [].
    // When attempting to merge deepMerge([], { key: 'value' }) hits the branch,
    // where target is redefined as an empty object, and ultimately returns an object.
    const result = mergeObjects([[1, 2, 3], { key: 'value' }]);
    expect(result).toEqual({ key: 'value' });
  });

  test('Empty array of objects – returns {}', () => {
    expect(mergeObjects([])).toEqual({});
  });

  test('Merging primitives – result of the last element', () => {
    expect(mergeObjects([1, 2])).toEqual(2);
  });

  test('Merging arrays (both values are arrays), uniqueArray = false', () => {
    const result = mergeObjects([
      [1, 2],
      [3, 4],
    ]);
    expect(result).toEqual([1, 2, 3, 4]);
  });

  test('Merging arrays (both values are arrays), uniqueArray = true – primitive duplicates are removed', () => {
    const result = mergeObjects(
      [
        [1, 2],
        [2, 3, 1],
      ],
      true,
    );
    expect(result).toEqual([1, 2, 3]);
  });

  test('If source is an array, but target is not an array – target is overwritten with the source value', () => {
    // The first element is an object, so the result is initialized as {},
    // then deepMerge({}, [10, 20, 10]) will return the deduped array at uniqueArray = true.
    const result = mergeObjects([{ a: 1 }, [10, 20, 10]], true);
    expect(result).toEqual([10, 20]);
  });

  test('Merging objects – skipping keys if source[key] === undefined', () => {
    const result = mergeObjects([{ a: 1 }, { a: undefined, b: 2 }]);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test('Merging nested arrays within objects (without deduplication)', () => {
    const result = mergeObjects([{ a: [1, 2] }, { a: [2, 3] }]);
    // When merging arrays within objects, simply concatenation
    expect(result).toEqual({ a: [1, 2, 2, 3] });
  });

  test('Merging nested arrays within objects (with deduplication)', () => {
    const result = mergeObjects([{ a: [1, 2] }, { a: [2, 1, 3] }], true);
    expect(result).toEqual({ a: [1, 2, 3] });
  });

  test('Merging nested objects', () => {
    const result = mergeObjects([{ a: { b: 1 } }, { a: { c: 2 } }]);
    expect(result).toEqual({ a: { b: 1, c: 2 } });
  });

  test('Merging objects – overwriting with primitives', () => {
    const result = mergeObjects([{ a: 1 }, { a: 2 }]);
    expect(result).toEqual({ a: 2 });
  });

  test('Merging, when source is null – returns null', () => {
    // When calling deepMerge({}, null) the condition "source !== null" does not pass,
    // so the source is returned, i.e., null.
    const result = mergeObjects([{}, null]);
    expect(result).toEqual(null);
  });

  test('Merging with a function – if source is a function, returns the function', () => {
    const fn = () => 42;
    const result = mergeObjects([{}, fn]);
    expect(result).toEqual(fn);
  });

  test('Merging, when target is initially an array, and source is an object with an undefined key', () => {
    // The first element is an array, so the result is initialized as [].
    // When merging deepMerge([], { a: undefined, b: 3 })
    // target is redefined as an empty object, and the key "a" is skipped.
    const result = mergeObjects([[1, 2], { a: undefined, b: 3 }]);
    expect(result).toEqual({ b: 3 });
  });

  test('Merging, when target value is an array, but source is an object', () => {
    // If the target contains an array, but the source for the same key is an object,
    // then the target is replaced with an empty object and deep merging is performed.
    const result = mergeObjects([{ a: [1, 2, { b: 10 }] }, { a: { c: 20 } }]);
    expect(result).toEqual({ a: { c: 20 } });
  });
});

describe('Helpers.deepMergeField', () => {
  test('Merging objects without specifying fields for merging', () => {
    interface TestType {
      [key: string]: unknown;
      a?: number;
      b?: { x?: number; y?: number };
      c?: string;
    }
    const obj1: TestType = { a: 1, b: { x: 1 } };
    const obj2: TestType = { b: { y: 2 }, c: 'test' };
    const result = deepMergeField(obj1, obj2, []);
    expect(result).toEqual({ a: 1, b: { y: 2 }, c: 'test' });
  });

  test('Merging objects with specified fields for merging', () => {
    interface TestType {
      [key: string]: unknown;
      a?: number;
      b?: { x?: number; y?: number };
      c?: string;
      d?: { m?: number; n?: number };
    }
    const obj1: TestType = { a: 1, b: { x: 1 }, d: { m: 1 } };
    const obj2: TestType = { a: 10, b: { y: 2 }, c: 'test', d: { n: 2 } };
    const result = deepMergeField(obj1, obj2, ['b', 'd']);
    expect(result).toEqual({ a: 10, b: { x: 1, y: 2 }, c: 'test', d: { m: 1, n: 2 } });
  });

  test('Merging when a field is missing in obj2', () => {
    const obj1 = { a: { x: 1 } };
    const obj2 = {} as { a?: { x: number } };
    // If a property is present only in obj1, its value remains.
    const result = deepMergeField(obj1, obj2, ['a']);
    expect(result).toEqual({ a: { x: 1 } });
  });

  test('Merging when a field is missing in obj1', () => {
    const obj1 = {} as { a?: { y: number } };
    const obj2 = { a: { y: 2 } };
    // If a property is present only in obj2, the merge gives the value from obj2.
    const result = deepMergeField(obj1, obj2, ['a']);
    expect(result).toEqual({ a: { y: 2 } });
  });

  test('Merging fields containing primitives', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 2 };
    // When attempting to merge primitives, the default value (nullish) => {} is triggered.
    // The spread operator converts the number into a wrapper, which lacks its own enumerable properties,
    // so mergedFields.a will be an empty object.
    const result = deepMergeField(obj1, obj2, ['a']);
    expect(result).toEqual({ a: {} });
  });

  test('Merging when the value is undefined in obj1', () => {
    const obj1 = { a: undefined };
    const obj2 = { a: { b: 2 } };
    // If the value in obj1 is undefined, the default empty value is used.
    const result = deepMergeField(obj1, obj2, ['a']);
    expect(result).toEqual({ a: { b: 2 } });
  });

  test('Merging when the value is undefined in obj2', () => {
    const obj1 = { a: { x: 1 } };
    const obj2 = { a: undefined };
    // If the value in obj2 is undefined, the value from obj1 remains.
    const result = deepMergeField(obj1, obj2, ['a']);
    expect(result).toEqual({ a: { x: 1 } });
  });
});

describe('Helpers.getTimer', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Возвращает корректные данные при передаче явных параметров (delta ≤ 60)', () => {
    const timeStartBigInt = BigInt(1_000_000_000); // 1 секунда
    const timeEndBigInt = BigInt(3_000_000_000); // 3 секунды → delta = 2 сек.

    const timeStart = new Date('2021-01-01T00:00:00.000Z');
    const timeEnd = new Date('2021-01-01T00:00:02.000Z');

    const result = getTimer({
      timeStartBigInt,
      timeEndBigInt,
      timeStart,
      timeEnd,
    });

    expect(result.timeStart).toEqual(timeStart);
    expect(result.timeEnd).toEqual(timeEnd);
    expect(result.timeStartBigInt).toBe(timeStartBigInt);
    expect(result.timeEndBigInt).toBe(timeEndBigInt);
    expect(result.delta).toBeCloseTo(2, 3);
    expect(result.deltaStr).toBe('2.000 s.');
  });

  test('Возвращает корректные данные при передаче явных параметров (delta > 60)', () => {
    const timeStartBigInt = BigInt(0);
    const timeEndBigInt = BigInt(61_000_000_000); // 61 секунда → delta = 61 сек.

    const timeStart = new Date('2021-01-01T00:00:00.000Z');
    const timeEnd = new Date('2021-01-01T00:01:01.000Z');

    const result = getTimer({
      timeStartBigInt,
      timeEndBigInt,
      timeStart,
      timeEnd,
    });

    expect(result.timeStart).toEqual(timeStart);
    expect(result.timeEnd).toEqual(timeEnd);
    expect(result.timeStartBigInt).toBe(timeStartBigInt);
    expect(result.timeEndBigInt).toBe(timeEndBigInt);
    expect(result.delta).toBeCloseTo(61, 3);
    // 61 секунда = 1 минута и 1 секунда
    expect(result.deltaStr).toBe('1 min. 1.000 s.');
  });

  test('Работает корректно с дефолтными параметрами (используем замоканные значения)', () => {
    // Замокаем process.hrtime.bigint, чтобы вернуть предсказуемые значения
    const hrtimeBigIntMock = jest
      .spyOn(process.hrtime, 'bigint')
      .mockReturnValueOnce(BigInt(5_000_000_000))
      .mockReturnValueOnce(BigInt(8_000_000_000)); // Разница = 3 сек.

    // Фиксируем текущее время до вызова функции
    const now = new Date();

    const result = getTimer();

    expect(result.timeStartBigInt).toBe(BigInt(5_000_000_000));
    expect(result.timeEndBigInt).toBe(BigInt(8_000_000_000));
    expect(result.delta).toBeCloseTo(3, 3);
    expect(result.deltaStr).toBe('3.000 s.');
    expect(result.timeStart).toBeInstanceOf(Date);
    expect(result.timeEnd).toBeInstanceOf(Date);

    // Проверяем, что timeStart и timeEnd примерно равны текущему времени
    const nowAfter = new Date();
    expect(result.timeStart.getTime()).toBeGreaterThanOrEqual(now.getTime());
    expect(result.timeEnd.getTime()).toBeLessThanOrEqual(nowAfter.getTime() + 10);
  });
});
