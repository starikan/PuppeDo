import Arguments from '../src/Arguments';

const argsDefault = {
  PPD_DATA: {},
  PPD_DEBUG_MODE: false,
  PPD_DISABLE_ENV_CHECK: false,
  PPD_ENVS: [],
  PPD_LOG_DISABLED: false,
  PPD_LOG_EXTEND: false,
  PPD_OUTPUT: 'output',
  PPD_ROOT: process.cwd(),
  PPD_ROOT_ADDITIONAL: [],
  PPD_ROOT_IGNORE: ['.git', 'node_modules', '.history', 'output'],
  PPD_SELECTORS: {},
  PPD_TESTS: [],
  PPD_LOG_LEVEL_NESTED: 0,
  PPD_LOG_LEVEL_TYPE: 'raw',
  PPD_LOG_LEVEL_TYPE_IGNORE: [],
  PPD_LOG_SCREENSHOT: false,
  PPD_LOG_FULLPAGE: false,
  PPD_LOG_TEST_NAME: true,
};

const argsModify = {
  PPD_DATA: { foo: 'bar' },
  PPD_DEBUG_MODE: true,
  PPD_DISABLE_ENV_CHECK: true,
  PPD_ENVS: ['hyy'],
  PPD_LOG_DISABLED: true,
  PPD_LOG_EXTEND: true,
  PPD_OUTPUT: 'zee',
  PPD_ROOT: 'rrr',
  PPD_ROOT_ADDITIONAL: ['iii', 'ooo'],
  PPD_ROOT_IGNORE: ['dqq'],
  PPD_SELECTORS: { joo: 'jii' },
  PPD_TESTS: ['suu'],
  PPD_LOG_LEVEL_NESTED: 10,
  PPD_LOG_LEVEL_TYPE: 'info',
  PPD_LOG_LEVEL_TYPE_IGNORE: ['joo'],
  PPD_LOG_SCREENSHOT: true,
  PPD_LOG_FULLPAGE: true,
  PPD_LOG_TEST_NAME: false,
};

const argsENV = {
  PPD_DATA: '{"foo":"bar"}',
  PPD_DEBUG_MODE: 'true',
  PPD_DISABLE_ENV_CHECK: 'true',
  PPD_ENVS: 'hyy',
  PPD_LOG_DISABLED: 'true',
  PPD_LOG_EXTEND: 'true',
  PPD_OUTPUT: 'zee',
  PPD_ROOT: 'rrr',
  PPD_ROOT_ADDITIONAL: 'iii, ooo',
  PPD_ROOT_IGNORE: 'dqq',
  PPD_SELECTORS: '{"joo": "jii"}',
  PPD_TESTS: 'suu',
  PPD_LOG_LEVEL_NESTED: '10',
  PPD_LOG_LEVEL_TYPE: 'info',
  PPD_LOG_LEVEL_TYPE_IGNORE: 'joo',
  PPD_LOG_SCREENSHOT: 'true',
  PPD_LOG_FULLPAGE: 'true',
  PPD_LOG_TEST_NAME: 'false',
};

// Reset Arguments
function setArg<T>(argName: string, argData: T): any {
  // eslint-disable-next-line no-new
  new Arguments({}, true);

  const argMock = { [argName]: argData };
  const argResult = new Arguments(argMock, true).args[argName];

  return [argData, argResult];
}

function errors(name: string, type: string): Error {
  return new Error(`Invalid argument type '${name}', '${type}' required.`);
}

test('Arguments is Singleton and Default args', () => {
  expect(new Arguments().args).toEqual(argsDefault);
  expect(new Arguments().args).toEqual(argsDefault);
  expect(new Arguments({ PPD_DEBUG_MODE: false }, true).args).toEqual(argsDefault);
});

test('Arguments check', () => {
  let argData: string;
  let argResult: string | Object;

  // Object
  [, argResult] = setArg('PPD_DATA', '{"foo": "bar"}');
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
  [, argResult] = setArg('PPD_ROOT_ADDITIONAL', 'boo,    bar');
  expect(argResult).toEqual(['boo', 'bar']);
  [, argResult] = setArg('PPD_ROOT_ADDITIONAL', 'boo,bar');
  expect(argResult).toEqual(['boo', 'bar']);
  [, argResult] = setArg('PPD_ROOT_ADDITIONAL', 'boo');
  expect(argResult).toEqual(['boo']);
  [, argResult] = setArg('PPD_ROOT_ADDITIONAL', '');
  expect(argResult).toEqual(['']);

  expect(() => setArg('PPD_ROOT_ADDITIONAL', false)).toThrowError(errors('PPD_ROOT_ADDITIONAL', 'array'));
  expect(() => setArg('PPD_ROOT_ADDITIONAL', true)).toThrowError(errors('PPD_ROOT_ADDITIONAL', 'array'));
  expect(() => setArg('PPD_ROOT_ADDITIONAL', {})).toThrowError(errors('PPD_ROOT_ADDITIONAL', 'array'));
  expect(() => setArg('PPD_ROOT_ADDITIONAL', { foo: 'bar' })).toThrowError(errors('PPD_ROOT_ADDITIONAL', 'array'));
  expect(() => setArg('PPD_ROOT_ADDITIONAL', 1)).toThrowError(errors('PPD_ROOT_ADDITIONAL', 'array'));
  expect(() => setArg('PPD_ROOT_ADDITIONAL', 0)).toThrowError(errors('PPD_ROOT_ADDITIONAL', 'array'));

  // String
  [argData, argResult] = setArg('PPD_OUTPUT', 'output');
  expect(argData).toEqual(argResult);
  [argData, argResult] = setArg('PPD_OUTPUT', '');
  expect(argData).toEqual(argResult);
  expect(() => setArg('PPD_OUTPUT', false)).toThrowError(errors('PPD_OUTPUT', 'string'));
  expect(() => setArg('PPD_OUTPUT', true)).toThrowError(errors('PPD_OUTPUT', 'string'));
  expect(() => setArg('PPD_OUTPUT', {})).toThrowError(errors('PPD_OUTPUT', 'string'));
  expect(() => setArg('PPD_OUTPUT', { foo: 'bar' })).toThrowError(errors('PPD_OUTPUT', 'string'));
  expect(() => setArg('PPD_OUTPUT', [])).toThrowError(errors('PPD_OUTPUT', 'string'));
  expect(() => setArg('PPD_OUTPUT', ['bar'])).toThrowError(errors('PPD_OUTPUT', 'string'));
  expect(() => setArg('PPD_OUTPUT', 1)).toThrowError(errors('PPD_OUTPUT', 'string'));
  expect(() => setArg('PPD_OUTPUT', 0)).toThrowError(errors('PPD_OUTPUT', 'string'));

  // Number
  [argData, argResult] = setArg('PPD_LOG_LEVEL_NESTED', 0);
  expect(argData).toEqual(argResult);
  [argData, argResult] = setArg('PPD_LOG_LEVEL_NESTED', 1);
  expect(argData).toEqual(argResult);
  [, argResult] = setArg('PPD_LOG_LEVEL_NESTED', '0');
  expect(argResult).toEqual(0);
  [, argResult] = setArg('PPD_LOG_LEVEL_NESTED', '1');
  expect(argResult).toEqual(1);
  expect(() => setArg('PPD_LOG_LEVEL_NESTED', false)).toThrowError(errors('PPD_LOG_LEVEL_NESTED', 'number'));
  expect(() => setArg('PPD_LOG_LEVEL_NESTED', true)).toThrowError(errors('PPD_LOG_LEVEL_NESTED', 'number'));
  expect(() => setArg('PPD_LOG_LEVEL_NESTED', {})).toThrowError(errors('PPD_LOG_LEVEL_NESTED', 'number'));
  expect(() => setArg('PPD_LOG_LEVEL_NESTED', { foo: 'bar' })).toThrowError(errors('PPD_LOG_LEVEL_NESTED', 'number'));
  expect(() => setArg('PPD_LOG_LEVEL_NESTED', [])).toThrowError(errors('PPD_LOG_LEVEL_NESTED', 'number'));
  expect(() => setArg('PPD_LOG_LEVEL_NESTED', ['bar'])).toThrowError(errors('PPD_LOG_LEVEL_NESTED', 'number'));
  expect(() => setArg('PPD_LOG_LEVEL_NESTED', 'foo')).toThrowError(errors('PPD_LOG_LEVEL_NESTED', 'number'));
  expect(() => setArg('PPD_LOG_LEVEL_NESTED', '')).toThrowError(errors('PPD_LOG_LEVEL_NESTED', 'number'));

  [argData, argResult] = setArg('PPD_DISABLE_ENV_CHECK', false);
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_LOG_DISABLED', false);
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_LOG_EXTEND', false);
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_ROOT', 'test');
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_ROOT_IGNORE', ['huu']);
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_SELECTORS', { foo: 'bar' });
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_LOG_LEVEL_NESTED', 0);
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_LOG_LEVEL_TYPE', 'raw');
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_LOG_LEVEL_TYPE_IGNORE', ['raw']);
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_ENVS', ['test']);
  expect(argData).toEqual(argResult);

  [argData, argResult] = setArg('PPD_TESTS', ['kii', 'loo']);
  expect(argData).toEqual(argResult);
});

test('Arguments CLI', () => {
  const rawArgv = process.argv;

  const argsJSON = Object.keys(argsModify).map((key) => {
    const isString = typeof argsModify[key] === 'string';
    const val = isString ? argsModify[key] : JSON.stringify(argsModify[key]);
    return `${key}=${val}`;
  });
  process.argv = [...process.argv, ...argsJSON];
  const argsSplited = new Arguments({}, true).args;
  expect(argsModify).toEqual(argsSplited);
  process.argv = rawArgv;

  process.argv = [...process.argv, argsJSON.join(' ')];
  const argsSolid = new Arguments({}, true).args;
  expect(argsModify).toEqual(argsSolid);
  process.argv = rawArgv;
});

test('Arguments ENV', () => {
  process.env = { ...process.env, ...argsENV };
  const { args } = new Arguments({}, true);
  expect(argsModify).toEqual(args);
  Object.keys(argsModify).map((v) => delete process.env[v]);
});
