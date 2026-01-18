import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { Arguments } from '../src/Arguments';
import AgentContent, { resolveTest } from '../src/TestContent';

describe('TestContent extra', () => {
  test('resolveTest throws on duplicate lifecycle keys', () => {
    new Arguments({ PPD_LIFE_CYCLE_FUNCTIONS: ['name'] as any }, {}, true);
    expect(() => resolveTest({ name: 't' } as any)).toThrow('PPD_LIFE_CYCLE_FUNCTIONS contains keys');
  });

  test('resolveTest adds lifecycle placeholders when no duplicates', () => {
    new Arguments({ PPD_LIFE_CYCLE_FUNCTIONS: ['beforeRun'] as any }, {}, true);
    const resolved = resolveTest({ name: 't' } as any);
    expect(Array.isArray((resolved as any).beforeRun)).toBe(true);
  });

  test('getPaths returns empty for missing root', () => {
    new Arguments({ PPD_ROOT: 'Z:/missing/path' }, {}, true);
    expect(AgentContent.getPaths()).toEqual([]);
  });

  test('checkDuplicates errors for blank names and duplicates', () => {
    expect(() => AgentContent.checkDuplicates([{ name: '', testFile: 'a', type: 'agent' } as any])).toThrow(
      "There is blank 'name' value",
    );

    expect(() =>
      AgentContent.checkDuplicates([
        { name: 'dup', testFile: 'a', type: 'agent' } as any,
        { name: 'dup', testFile: 'b', type: 'agent' } as any,
      ]),
    ).toThrow("There is duplicates of 'agent'");
  });

  test('readFile handles invalid JSON and YAML', () => {
    const tempDir = '.temp/testcontent';
    fs.mkdirSync(tempDir, { recursive: true });
    const jsonFile = path.join(tempDir, 'bad.json');
    fs.writeFileSync(jsonFile, '{bad');
    const yamlFile = path.join(tempDir, 'bad.yaml');
    fs.writeFileSync(yamlFile, '::bad');

    expect(AgentContent.readFile(jsonFile)).toEqual([]);
    expect(AgentContent.readFile(yamlFile)).toEqual(['::bad']);
  });

  test('fileResolver handles missing name and resolveTest', () => {
    new Arguments({ PPD_IGNORE_AGENTS_WITHOUT_NAME: false }, {}, true);
    expect(() => AgentContent.fileResolver({} as any, 'a.yaml')).toThrow('Every agent need name');

    new Arguments({ PPD_IGNORE_AGENTS_WITHOUT_NAME: true }, {}, true);
    expect(AgentContent.fileResolver({} as any, 'a.yaml')).toBeUndefined();

    const resolved = AgentContent.fileResolver({ name: 't' } as any, 'a.yaml');
    expect((resolved as any).name).toBe('t');
  });

  test('fileResolver resolves test when filePath is empty', () => {
    new Arguments({ PPD_IGNORE_AGENTS_WITHOUT_NAME: true }, {}, true);

    const resolved = AgentContent.fileResolver({ name: 't' } as any, '');

    expect((resolved as any).type).toBe('agent');
    expect((resolved as any).name).toBe('t');
  });

  test('fileResolver returns undefined when name missing and ignore enabled', () => {
    new Arguments({ PPD_IGNORE_AGENTS_WITHOUT_NAME: true }, {}, true);
    expect(AgentContent.fileResolver({} as any, 'a.yaml')).toBeUndefined();
  });

  test('normalizeRawEntries parses JSON and YAML', () => {
    const raw = [
      '{"name":"a"}',
      'name: b',
      [{ name: 'c' }],
      { name: 'd' },
    ];

    const result = (AgentContent as any).normalizeRawEntries(raw);
    expect(result.length).toBe(4);

    expect(() => (AgentContent as any).normalizeRawEntries(['1'])).toThrow(
      'PPD_TESTS_RAW contains invalid YAML/JSON string',
    );
    expect(() => (AgentContent as any).normalizeRawEntries(['{'])).toThrow('PPD_TESTS_RAW contains invalid YAML/JSON string');
  });

  test('normalizeRawEntries handles empty and object entries', () => {
    const resultEmpty = (AgentContent as any).normalizeRawEntries(undefined as any);
    expect(resultEmpty).toEqual([]);

    const result = (AgentContent as any).normalizeRawEntries([null, { name: 'obj' }]);
    expect(result).toEqual([{ name: 'obj' }]);
  });

  test('normalizeRawEntries ignores non-object non-string entries', () => {
    const result = (AgentContent as any).normalizeRawEntries([1 as any]);
    expect(result).toEqual([]);
  });

  test('normalizeRawEntries keeps object entry', () => {
    const result = (AgentContent as any).normalizeRawEntries([{ name: 'obj' }]);
    expect(result).toEqual([{ name: 'obj' }]);
  });

  test('normalizeRawEntries throws on non-object items in array', () => {
    const yamlSpy = jest.spyOn(yaml, 'loadAll').mockImplementation(() => {
      throw new Error('fail');
    });

    expect(() => (AgentContent as any).normalizeRawEntries(['[1]'] as any)).toThrow(
      'PPD_TESTS_RAW contains invalid YAML/JSON string',
    );

    yamlSpy.mockRestore();
  });

  test('normalizeRawEntries throws on invalid YAML/JSON content', () => {
    const yamlSpy = jest.spyOn(yaml, 'loadAll').mockReturnValue(1 as any);

    expect(() => (AgentContent as any).normalizeRawEntries(['1'] as any)).toThrow(
      'PPD_TESTS_RAW contains invalid YAML/JSON string',
    );

    yamlSpy.mockRestore();
  });

  test('mergeContentWithRaw keeps order and overrides', () => {
    const files = [
      { name: 'a', type: 'agent' },
      { name: 'b', type: 'data' },
    ];
    const raw = [{ name: 'a', type: 'agent', extra: true }];

    const result = (AgentContent as any).mergeContentWithRaw(files, raw);
    expect(result[0]).toEqual(expect.objectContaining({ name: 'a', extra: true }));
  });

  test('resolveRunners merges extensions and throws when missing', () => {
    const runners = [
      {
        name: 'base',
        type: 'runner',
        browser: { headless: true },
        data: { a: 1 },
        selectors: { s: 1 },
        description: 'base',
      },
      {
        name: 'child',
        type: 'runner',
        runnersExt: ['base'],
        dataExt: ['d1'],
        selectorsExt: ['s1'],
        description: 'child',
      },
    ] as any;

    const dataAll = [{ name: 'd1', type: 'data', data: { x: 1 } }] as any;
    const selectorsAll = [{ name: 's1', type: 'selectors', data: { y: 1 } }] as any;

    const resolved = AgentContent.resolveRunners(runners, dataAll, selectorsAll);
    expect(resolved[1].browser).toEqual({ headless: true });
    expect(resolved[1].data).toEqual({ a: 1, x: 1 });
    expect(resolved[1].selectors).toEqual({ s: 1, y: 1 });

    expect(() => AgentContent.resolveRunners([{ name: 'bad', type: 'runner', runnersExt: ['x'] } as any], [], [])).toThrow(
      "PuppeDo can't resolve extended runner 'x' in runner 'bad'",
    );
  });

  test('getAllData uses raw entries', () => {
    new Arguments({ PPD_TESTS_RAW: [{ name: 'rawTest' }] as any }, {}, true);
    const content = new AgentContent(true);
    const data = content.getAllData(true);

    expect(data.agents.some((v) => v.name === 'rawTest')).toBe(true);
  });

  test('getAllData uses PPD_TESTS_RAW fallback file name', () => {
    new Arguments({ PPD_TESTS_RAW: [{ name: 'rawTest', testFile: '' }] as any }, {}, true);
    const fileResolverSpy = jest.spyOn(AgentContent, 'fileResolver');

    new AgentContent(true).getAllData(true);

    expect(fileResolverSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'rawTest' }), 'PPD_TESTS_RAW');
    fileResolverSpy.mockRestore();
  });

  test('getAllData uses provided testFile from raw entries', () => {
    new Arguments({ PPD_TESTS_RAW: [{ name: 'rawTest', testFile: 'raw.yml' }] as any }, {}, true);
    const fileResolverSpy = jest.spyOn(AgentContent, 'fileResolver');

    new AgentContent(true).getAllData(true);

    expect(fileResolverSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'rawTest' }), 'raw.yml');
    fileResolverSpy.mockRestore();
  });

  test('normalizeRawEntries accepts object entries', () => {
    const raw = [{ name: 'obj', type: 'test' }] as any;
    const normalized = (AgentContent as any).normalizeRawEntries(raw);

    expect(normalized).toEqual([expect.objectContaining({ name: 'obj' })]);
  });

  test('resolveRunners merges browser from runner extension', () => {
    const runners = [
      {
        name: 'base',
        type: 'runner',
        browser: { headless: true },
      },
      {
        name: 'child',
        type: 'runner',
        runnersExt: ['base'],
        browser: { headless: false },
      },
    ] as any;

    const resolved = AgentContent.resolveRunners(runners, [], []);
    expect(resolved[1].browser).toEqual({ headless: true });
  });

  test('resolveRunners keeps browser when base runner has it', () => {
    const runners = [
      {
        name: 'base',
        type: 'runner',
        browser: { headless: true },
      },
      {
        name: 'child',
        type: 'runner',
        runnersExt: ['base'],
      },
    ] as any;

    const resolved = AgentContent.resolveRunners(runners, [], []);
    expect(resolved[1].browser).toEqual({ headless: true });
  });

  test('resolveRunners merges browser from extension when base provides it', () => {
    const runners = [
      {
        name: 'base',
        type: 'runner',
        browser: { headless: true },
      },
      {
        name: 'child',
        type: 'runner',
        runnersExt: ['base'],
      },
    ] as any;

    const resolved = AgentContent.resolveRunners(runners, [], []);
    expect(resolved[1].browser).toEqual({ headless: true });
  });
});
