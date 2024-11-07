import fs from 'fs';
import path from 'path';
import { sleep, paintString, blankSocket, mergeObjects, walkSync } from '../src/Helpers';

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

describe('mergeObjects', () => {
  test('should merge simple objects', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 0, b: 3, c: 4 };
    const result = mergeObjects(obj1, obj2);
    expect(result).toEqual({ a: 0, b: 3, c: 4 });
  });

  test('should merge nested objects', () => {
    const obj1 = { a: { x: 1 }, b: 2 };
    const obj2 = { a: { x: 0, y: 2 }, b: 2, c: 3 };
    const result = mergeObjects(obj1, obj2);
    expect(result).toEqual({ a: { x: 0, y: 2 }, b: 2, c: 3 });
  });

  test('should merge arrays', () => {
    const obj1 = { a: [1, 2] };
    const obj2 = { a: [3, 4], b: 5 };
    const result = mergeObjects(obj1, obj2);
    expect(result).toEqual({ a: [1, 2, 3, 4], b: 5 });
  });

  test('should handle null and undefined values', () => {
    const obj1 = { a: null, b: 2 };
    const obj2 = { a: 3, b: undefined };
    const result = mergeObjects(obj1, obj2);
    expect(result).toEqual({ a: 3, b: 2 });
  });

  test('should handle empty objects', () => {
    const obj1 = {};
    const obj2 = { a: 1 };
    const result = mergeObjects(obj1, obj2);
    expect(result).toEqual({ a: 1 });
  });

  test('should merge multiple objects', () => {
    const obj1: { a?: number; b?: number; c?: number } = { a: 1 };
    const obj2: { a?: number; b?: number; c?: number } = { a: 2, b: 2 };
    const obj3: { a?: number; b?: number; c?: number } = { c: 3 };
    const result = mergeObjects(obj1, obj2, obj3);
    expect(result).toEqual({ a: 2, b: 2, c: 3 });
  });
});

describe('Helpers.walkSync', () => {
  const testDir = path.join(__dirname, 'testDir');
  const nestedDir = path.join(testDir, 'nested');
  const ignoredDir = path.join(testDir, 'ignored');

  beforeEach(() => {
    // Создаем тестовую структуру директорий и файлов
    fs.rmSync(testDir, { recursive: true, force: true });

    fs.mkdirSync(testDir);
    fs.mkdirSync(nestedDir);
    fs.mkdirSync(ignoredDir);

    fs.writeFileSync(path.join(testDir, 'file1.txt'), 'content1');
    fs.writeFileSync(path.join(testDir, 'file2.txt'), 'content2');
    fs.writeFileSync(path.join(nestedDir, 'file3.txt'), 'content3');
    fs.writeFileSync(path.join(ignoredDir, 'file4.txt'), 'content4');
  });

  afterEach(() => {
    // Удаляем тестовую структуру директорий и файлов
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('should return all files in directory', () => {
    const files = walkSync(testDir);
    expect(files).toEqual(
      expect.arrayContaining([
        path.join(testDir, 'file1.txt'),
        path.join(testDir, 'file2.txt'),
        path.join(nestedDir, 'file3.txt'),
        path.join(ignoredDir, 'file4.txt'),
      ]),
    );
  });

  test('should ignore specified directories', () => {
    const files = walkSync(testDir, { ignoreFolders: ['ignored'] });
    expect(files).toEqual(
      expect.arrayContaining([
        path.join(testDir, 'file1.txt'),
        path.join(testDir, 'file2.txt'),
        path.join(nestedDir, 'file3.txt'),
      ]),
    );
  });

  test('should ignore specified files', () => {
    const files = walkSync(testDir, { ignoreFiles: ['file2.txt'] });
    expect(files).toEqual(
      expect.arrayContaining([
        path.join(testDir, 'file1.txt'),
        path.join(nestedDir, 'file3.txt'),
        path.join(ignoredDir, 'file4.txt'),
      ]),
    );
    expect(files).not.toEqual(expect.arrayContaining([path.join(testDir, 'file2.txt')]));
  });

  test('should return only files with specified extensions', () => {
    const files = walkSync(testDir, { includeExtensions: ['.txt'] });
    expect(files).toEqual(
      expect.arrayContaining([
        path.join(testDir, 'file1.txt'),
        path.join(testDir, 'file2.txt'),
        path.join(nestedDir, 'file3.txt'),
        path.join(ignoredDir, 'file4.txt'),
      ]),
    );
  });

  test('should respect depth limit', () => {
    const files = walkSync(testDir, { depth: 1 });
    expect(files).toEqual(expect.arrayContaining([path.join(testDir, 'file1.txt'), path.join(testDir, 'file2.txt')]));
  });

  test('should return empty array if directory does not exist', () => {
    const files = walkSync(path.join(__dirname, 'nonExistentDir'));
    expect(files).toEqual([]);
  });

  test('should return empty array if directory is empty', () => {
    const emptyDir = path.join(testDir, 'empty');
    fs.mkdirSync(emptyDir);
    const files = walkSync(emptyDir);
    expect(files).toEqual([]);
  });

  test('should return empty array if all files are ignored', () => {
    const files = walkSync(testDir, { ignoreFiles: ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt'] });
    expect(files).toEqual([]);
  });

  test('should return empty array if all directories are ignored', () => {
    const files = walkSync(testDir, { ignoreFolders: ['nested', 'ignored'] });
    expect(files).toEqual(expect.arrayContaining([path.join(testDir, 'file1.txt'), path.join(testDir, 'file2.txt')]));
  });

  test('should handle multiple extensions', () => {
    fs.writeFileSync(path.join(testDir, 'file5.md'), 'content5');
    const files = walkSync(testDir, { includeExtensions: ['.txt', '.md'] });
    expect(files).toEqual(
      expect.arrayContaining([
        path.join(testDir, 'file1.txt'),
        path.join(testDir, 'file2.txt'),
        path.join(nestedDir, 'file3.txt'),
        path.join(ignoredDir, 'file4.txt'),
        path.join(testDir, 'file5.md'),
      ]),
    );
  });
});
