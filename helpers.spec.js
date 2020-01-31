const _ = require('lodash');

const { merge, sleep, stylesConsole, blankSocket } = require('./helpers');

test('Helpers -> merge', () => {
  const foobar = { foo: { bar: 3 } };
  const foobaz = { foo: { baz: 4 } };
  const bar = { bar: 'yay!' };
  expect(merge(foobar, foobaz, bar)).toEqual({ foo: { bar: 3, baz: 4 }, bar: 'yay!' });
  expect(merge([1, 2, 3], [3, 2, 1])).toEqual([3, 2, 1]);
});

test('Helpers -> sleep', () => {});

test('Helpers -> stylesConsole', () => {
  const fields = ['raw', 'debug', 'info', 'test', 'warn', 'error', 'trace', 'env'];
  expect(Object.keys(stylesConsole)).toEqual(fields);
});

test('Helpers -> blankSocket', () => {
  expect(Object.keys(blankSocket)).toEqual(['send', 'sendYAML']);
  expect(_.isFunction(blankSocket.send)).toBe(true);
  expect(_.isFunction(blankSocket.sendYAML)).toBe(true);
});
