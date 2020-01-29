const _ = require('lodash');

const { Arguments } = require('./Arguments');

function setArg(argName, argData) {
  // Reset Arguments
  const env = {
    PPD_TESTS: ['goo'],
    PPD_ENVS: ['goo'],
  };
  new Arguments(env, true);

  const argMock = { ...env, [argName]: argData };
  const argResult = _.get(new Arguments(argMock, true), argName);

  return [argData, argResult];
}

function errors(name, type) {
  return { message: `Invalid argument type '${name}', '${type}' required.` };
}

test('Arguments init Errors', () => {
  expect(() => new Arguments()).toThrowError({
    message: 'There is no tests to run. Pass any test in PPD_TESTS argument',
  });
  expect(() => new Arguments({}, true)).toThrowError({
    message: 'There is no tests to run. Pass any test in PPD_TESTS argument',
  });
  expect(() => new Arguments({ PPD_TESTS: 'test' }, true)).toThrowError({
    message: 'There is no environments to run. Pass any test in PPD_ENVS argument',
  });
});

test('Arguments is Singleton and Default args', () => {
  expect(() => new Arguments({}, true)).toThrowError({
    message: 'There is no tests to run. Pass any test in PPD_TESTS argument',
  });

  const argsDefault = {
    PPD_DATA: {},
    PPD_DEBUG_MODE: false,
    PPD_DISABLE_ENV_CHECK: false,
    PPD_ENVS: [],
    PPD_LOG_DISABLED: false,
    PPD_LOG_TIMER: false,
    PPD_OUTPUT: 'output',
    PPD_ROOT: process.cwd(),
    PPD_ROOT_ADDITIONAL: [],
    PPD_ROOT_IGNORE: ['.git', 'node_modules', '.history'],
    PPD_SELECTORS: {},
    PPD_TESTS: [],
  };
  expect(new Arguments()).toEqual(argsDefault);
});

test('Arguments check', () => {
  expect(() => new Arguments({}, true)).toThrowError({
    message: 'There is no tests to run. Pass any test in PPD_TESTS argument',
  });

  let argData, argResult;

  // Object
  [argData, argResult] = setArg('PPD_DATA', '{"foo": "bar"}');
  expect(argResult).toEqual({ foo: 'bar' });
  [argData, argResult] = setArg('PPD_DATA', { foo: 'bar' });
  expect(argData).toEqual(argResult);
  [argData, argResult] = setArg('PPD_DATA', {});
  expect(argData).toEqual(argResult);

  expect(() => setArg('PPD_DATA', false)).toThrowError(errors('PPD_DATA', 'object'));
  expect(() => setArg('PPD_DATA', true)).toThrowError(errors('PPD_DATA', 'object'));
  expect(() => setArg('PPD_DATA', [])).toThrowError(errors('PPD_DATA', 'object'));
  expect(() => setArg('PPD_DATA', ['foo'])).toThrowError(errors('PPD_DATA', 'object'));
  expect(() => setArg('PPD_DATA', 'foo')).toThrowError(errors('PPD_DATA', 'object'));
  expect(() => setArg('PPD_DATA', '')).toThrowError(errors('PPD_DATA', 'object'));
  expect(() => setArg('PPD_DATA', 1)).toThrowError(errors('PPD_DATA', 'object'));
  expect(() => setArg('PPD_DATA', 0)).toThrowError(errors('PPD_DATA', 'object'));

  // Boolean
  [argData, argResult] = setArg('PPD_DEBUG_MODE', false);
  expect(argData).toEqual(argResult);
  [argData, argResult] = setArg('PPD_DEBUG_MODE', 'false');
  expect(argResult).toEqual(false);
  [argData, argResult] = setArg('PPD_DEBUG_MODE', true);
  expect(argData).toEqual(argResult);
  [argData, argResult] = setArg('PPD_DEBUG_MODE', 'true');
  expect(argResult).toEqual(true);

  expect(() => setArg('PPD_DEBUG_MODE', {})).toThrowError(errors('PPD_DEBUG_MODE', 'boolean'));
  expect(() => setArg('PPD_DEBUG_MODE', { foo: 'bar' })).toThrowError(errors('PPD_DEBUG_MODE', 'boolean'));
  expect(() => setArg('PPD_DEBUG_MODE', [])).toThrowError(errors('PPD_DEBUG_MODE', 'boolean'));
  expect(() => setArg('PPD_DEBUG_MODE', ['foo'])).toThrowError(errors('PPD_DEBUG_MODE', 'boolean'));
  expect(() => setArg('PPD_DEBUG_MODE', 'foo')).toThrowError(errors('PPD_DEBUG_MODE', 'boolean'));
  expect(() => setArg('PPD_DEBUG_MODE', '')).toThrowError(errors('PPD_DEBUG_MODE', 'boolean'));
  expect(() => setArg('PPD_DEBUG_MODE', 1)).toThrowError(errors('PPD_DEBUG_MODE', 'boolean'));
  expect(() => setArg('PPD_DEBUG_MODE', 0)).toThrowError(errors('PPD_DEBUG_MODE', 'boolean'));

  // Array
  [argData, argResult] = setArg('PPD_ROOT_ADDITIONAL', ['boo']);
  expect(argData).toEqual(argResult);
  [argData, argResult] = setArg('PPD_ROOT_ADDITIONAL', []);
  expect(argData).toEqual(argResult);
  [argData, argResult] = setArg('PPD_ROOT_ADDITIONAL', 'boo,    bar');
  expect(argResult).toEqual(['boo', 'bar']);
  [argData, argResult] = setArg('PPD_ROOT_ADDITIONAL', 'boo,bar');
  expect(argResult).toEqual(['boo', 'bar']);
  [argData, argResult] = setArg('PPD_ROOT_ADDITIONAL', 'boo');
  expect(argResult).toEqual(['boo']);

  // String
  [argData, argResult] = setArg('PPD_OUTPUT', 'output');
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_DISABLE_ENV_CHECK', false);
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_LOG_DISABLED', false);
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_LOG_TIMER', false);
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_ROOT', 'test');
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_ROOT_IGNORE', ['huu']);
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_SELECTORS', { foo: 'bar' });
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_ENVS', ['test']);
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_TESTS', ['kii', 'loo']);
  expect(argData).toEqual(argResult);
});
