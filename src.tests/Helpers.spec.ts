import { merge, sleep, paintString, blankSocket } from '../src/Helpers';

test('Helpers -> merge', () => {
  const foobar: { foo?: { bar?: unknown; baz?: unknown }; bar?: unknown } = { foo: { bar: 3 } };
  const foobaz: { foo?: { bar?: unknown; baz?: unknown }; bar?: unknown } = { foo: { baz: 4 } };
  const bar: { foo?: { bar?: unknown; baz?: unknown }; bar?: unknown } = { bar: 'yay!' };
  expect(merge(foobar, foobaz, bar)).toEqual({ foo: { bar: 3, baz: 4 }, bar: 'yay!' });
});

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
