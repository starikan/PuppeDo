import { merge, sleep, paintString, blankSocket } from '../src/Helpers';

test('Helpers -> merge', () => {
  const foobar = { foo: { bar: 3 } };
  const foobaz = { foo: { baz: 4 } };
  const bar = { bar: 'yay!' };
  expect(merge(foobar, foobaz, bar)).toEqual({ foo: { bar: 3, baz: 4 }, bar: 'yay!' });
  expect(merge([1, 2, 3], [3, 2, 1])).toEqual([3, 2, 1]);
});

test('Helpers -> sleep', async () => {
  const start = process.hrtime.bigint();
  await sleep(20);
  const delay = process.hrtime.bigint() - start;
  expect(delay).toBeGreaterThanOrEqual(20);
});

test('Helpers -> paintString', () => {
  // expect(paintString('*******', 0)).toEqual('\u001b[0m*******\u001b[0m');
  // expect(paintString('*******', 'some weird')).toEqual('\u001b[0m*******\u001b[0m');
  // expect(paintString('*******', true)).toEqual('\u001b[0m*******\u001b[0m');
  // expect(paintString('*******', [])).toEqual('\u001b[0m*******\u001b[0m');
  // expect(paintString('*******', ['foo'])).toEqual('\u001b[0m*******\u001b[0m');
  // expect(paintString('*******', {})).toEqual('\u001b[0m*******\u001b[0m');
  expect(paintString('*******')).toEqual('\u001b[0m*******\u001b[0m');

  expect(paintString('*******', 'sane')).toEqual('\u001b[0m*******\u001b[0m');
  expect(paintString('*******', 'black')).toEqual('\u001b[30m*******\u001b[0m');
  expect(paintString('*******', 'red')).toEqual('\u001b[31m*******\u001b[0m');
  expect(paintString('*******', 'green')).toEqual('\u001b[32m*******\u001b[0m');
  expect(paintString('*******', 'yellow')).toEqual('\u001b[33m*******\u001b[0m');
  expect(paintString('*******', 'blue')).toEqual('\u001b[34m*******\u001b[0m');
  expect(paintString('*******', 'magenta')).toEqual('\u001b[35m*******\u001b[0m');
  expect(paintString('*******', 'cyan')).toEqual('\u001b[36m*******\u001b[0m');
  expect(paintString('*******', 'white')).toEqual('\u001b[37m*******\u001b[0m');

  expect(paintString('*******', 'raw')).toEqual('\u001b[0m*******\u001b[0m');
  expect(paintString('*******', 'timer')).toEqual('\u001b[0m*******\u001b[0m');
  expect(paintString('*******', 'debug')).toEqual('\u001b[0m*******\u001b[0m');
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
  expect(blankSocket.sendYAML({ type: 'string', data: {}, envsId: 'string' })).toBeFalsy();
});
