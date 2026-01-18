import { Arguments } from '../src/Arguments';
import { PluginsFabric, Plugins, Plugin } from '../src/PluginsCore';
import type { PluginDocumentation } from '../src/model';

const doc = (name: string): PluginDocumentation => ({
  name,
  type: 'plugin',
  description: { ru: [name], en: [name] },
  examples: [{ test: `${name}.yml`, result: `${name}.log` }],
  propogation: false,
});

describe('PluginsCore', () => {
  test('PluginsFabric orders and dependencies', () => {
    const fabric = new PluginsFabric({}, true);
    fabric.addPlugin(
      { name: 'a', plugin: () => (({ name: 'a', hook: () => () => {} }) as any), order: 2, depends: [], documentation: doc('a') } as any,
    );
    fabric.addPlugin(
      { name: 'b', plugin: () => (({ name: 'b', hook: () => () => {} }) as any), order: null, depends: ['a'], documentation: doc('b') } as any,
    );
    fabric.normalizeOrders();
    fabric.checkDepends();
    const ordered = fabric.getPluginsOrderedNames();

    expect(ordered[0]).toBe('a');
    expect(ordered).toContain('b');
    expect(fabric.getDocs().length).toBe(2);
    expect(fabric.getPlugin('a')).toBeDefined();
  });

  test('PluginsFabric debug output and scratch getters', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    new Arguments({ PPD_DEBUG_MODE: true }, {}, true);

    const fabric = new PluginsFabric(
      {
        a: {
          plugin: { name: 'a', plugin: () => (({ name: 'a', hook: () => () => {} }) as any), order: 1, depends: [], documentation: doc('a') },
          order: 1,
        } as any,
      },
      true,
    );

    expect(consoleSpy).toHaveBeenCalled();
    expect(fabric.getAllPluginsScratch().a).toBeDefined();
    consoleSpy.mockRestore();
  });

  test('PluginsFabric checkDepends throws when order missing', () => {
    const fabric = new PluginsFabric({}, true);
    fabric.addPlugin(
      { name: 'a', plugin: () => (({ name: 'a', hook: () => () => {} }) as any), order: null, depends: [], documentation: doc('a') } as any,
    );
    fabric.addPlugin(
      { name: 'b', plugin: () => (({ name: 'b', hook: () => () => {} }) as any), order: 2, depends: ['a'], documentation: doc('b') } as any,
    );

    expect(() => fabric.checkDepends()).toThrow('Plugin a not found in the execution order');
  });

  test('PluginsFabric handles null orders and dependency order errors', () => {
    const fabric = new PluginsFabric({}, true);
    fabric.addPlugin(
      { name: 'a', plugin: () => (({ name: 'a', hook: () => () => {} }) as any), order: null, depends: [], documentation: doc('a') } as any,
    );
    fabric.addPlugin(
      { name: 'b', plugin: () => (({ name: 'b', hook: () => () => {} }) as any), order: 1, depends: ['a'], documentation: doc('b') } as any,
    );

    const ordered = fabric.getPluginsOrderedNames();
    expect(ordered).toEqual(['b', 'a']);

    fabric.normalizeOrders();
    expect(() => fabric.checkDepends()).toThrow('Plugin a, required for b, not found or loaded after');
  });

  test('PluginsFabric normalizeOrders assigns values for null only', () => {
    const fabric = new PluginsFabric({}, true);
    fabric.addPlugin(
      { name: 'a', plugin: () => (({ name: 'a', hook: () => () => {} }) as any), order: null, depends: [], documentation: doc('a') } as any,
    );
    fabric.normalizeOrders();

    expect(fabric.getPluginsOrder().a).not.toBeNull();
  });

  test('PluginsFabric addPlugin supports string modules', () => {
    const fabric = new PluginsFabric({}, true);
    fabric.addPlugin('debug' as any);

    expect(fabric.getPlugin('debug')).toBeDefined();
  });

  test('Plugins hook calls in order', () => {
    const calls: string[] = [];
    const fabric = new PluginsFabric({}, true);
    fabric.addPlugin(
      {
        name: 'a',
        order: 1,
        depends: [],
        documentation: doc('a'),
        plugin: () => ({
          name: 'a',
          hook: (name: string) => () => calls.push(`a:${name}`),
        }),
      } as any,
    );
    fabric.addPlugin(
      {
        name: 'b',
        order: 2,
        depends: [],
        documentation: doc('b'),
        plugin: () => ({
          name: 'b',
          hook: (name: string) => () => calls.push(`b:${name}`),
        }),
      } as any,
    );
    fabric.normalizeOrders();
    fabric.checkDepends();
    const plugins = new Plugins('env-1', { findNode: jest.fn(), findParent: jest.fn(), updateStep: jest.fn() } as any);

    plugins.hook('initValues', { stepId: 's1' });

    expect(calls).toEqual(['a:initValues', 'b:initValues']);
  });

  test('Plugins getPlugins throws for missing plugin', () => {
    const fabric = new PluginsFabric({}, true);
    fabric.addPlugin(
      {
        name: 'only',
        order: 1,
        depends: [],
        documentation: doc('only'),
        plugin: () => ({ name: 'only', hook: () => () => {} }),
      } as any,
    );
    const plugins = new Plugins('env-1', { findNode: jest.fn(), findParent: jest.fn(), updateStep: jest.fn() } as any);

    expect(() => plugins.getPlugins('missing')).toThrow("Can't find plugin missing");
  });

  test('Plugins getPlugins returns existing plugin and hook executes', () => {
    const calls: string[] = [];
    const fabric = new PluginsFabric({}, true);
    fabric.addPlugin(
      {
        name: 'a',
        order: 1,
        depends: [],
        documentation: doc('a'),
        plugin: () => ({ name: 'a', hook: (n: string) => () => calls.push(n) }),
      } as any,
    );

    const plugins = new Plugins('env-1', { findNode: jest.fn(), findParent: jest.fn(), updateStep: jest.fn() } as any);
    const plugin = plugins.getPlugins('a');
    plugins.hook('initValues', { stepId: 's1' });

    expect(plugin.name).toBe('a');
    expect(calls).toEqual(['initValues']);
  });

  test('Plugin hook/getValues/setValues', () => {
    const agentTree = {
      findNode: jest.fn().mockReturnValue({ a: 2 }),
      findParent: jest.fn().mockReturnValue({ a: 3 }),
      findPreviousSibling: jest.fn().mockReturnValue({ a: 4, nested: { foo: 1, bar: 2 } }),
      updateStep: jest.fn(),
    } as any;

    const plugins = { agentTree } as any;
    const plugin = new Plugin({
      name: 'p',
      defaultValues: { a: 1, nested: { foo: 0 } },
      propogation: { nested: { type: 'lastSubling', fieldsOnly: ['foo'] } },
      plugins,
      hooks: { initValues: function () { return; } },
      isActive: ({ inputs }) => inputs.active !== false,
    });

    expect(plugin.getValues('s1')).toEqual({ a: 2, nested: { foo: 0 } });
    expect(plugin.getValuesParent('s1')).toEqual({ a: 3, nested: { foo: 0 } });

    const hookFn = plugin.hook('initValues');
    expect(typeof hookFn).toBe('function');
    hookFn({});
    const missingHook = plugin.hook('missing' as any);
    expect(typeof missingHook).toBe('function');
    missingHook({});

    const values = plugin.setValues('s1', { nested: { foo: 9 }, active: true } as any);
    expect(values.nested.foo).toBe(9);
    expect(agentTree.updateStep).toHaveBeenCalled();

    expect(plugin.getValue('s1', 'a')).toBe(2);

    const inactiveValues = plugin.setValues('s1', { active: false } as any);
    expect(inactiveValues).toEqual({ a: 1, nested: { foo: 0 } });
  });

  test('Plugin getValues handles null nodes and default id', () => {
    const agentTree = {
      findNode: jest.fn().mockReturnValue(null),
      findParent: jest.fn().mockReturnValue(null),
      findPreviousSibling: jest.fn().mockReturnValue(null),
      updateStep: jest.fn(),
    } as any;

    const plugin = new Plugin({
      name: 'p',
      defaultValues: { a: 1 },
      plugins: { agentTree } as any,
      hooks: {},
    });

    expect(plugin.getValues('s1')).toEqual({ a: 1 });
    expect(plugin.getValuesParent('s1')).toEqual({ a: 1 });
    expect(typeof plugin.id).toBe('string');
  });

  test('Plugin hook handles invalid hook implementation', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const plugins = { agentTree: { findNode: jest.fn(), findParent: jest.fn(), updateStep: jest.fn() } } as any;

    const plugin = new Plugin({
      name: 'p',
      defaultValues: { a: 1 },
      plugins,
      hooks: { initValues: 'bad' as any },
    });

    const hookFn = plugin.hook('initValues');
    expect(typeof hookFn).toBe('function');
    hookFn({});

    consoleSpy.mockRestore();
  });

  test('Plugin setValues propagates fieldsOnly and ignores errors', () => {
    const agentTree = {
      findNode: jest.fn().mockReturnValue({}),
      findParent: jest.fn().mockReturnValue({}),
      findPreviousSibling: jest.fn().mockReturnValue({ config: { a: 10, b: 20 } }),
      updateStep: jest.fn(),
    } as any;

    const plugins = { agentTree } as any;
    const plugin = new Plugin({
      name: 'p',
      defaultValues: { config: { a: 1, b: 2 } },
      propogation: { config: { type: 'lastSubling', fieldsOnly: ['a'] } },
      plugins,
      hooks: {},
    });

    const values = plugin.setValues('s1', { config: { b: 99 } } as any);
    expect(values.config.a).toBe(10);
    expect(values.config.b).toBe(99);

    agentTree.findPreviousSibling.mockReturnValue({ config: undefined });
    plugin.setValues('s1', {} as any);
    expect(agentTree.updateStep).toHaveBeenCalled();
  });

  test('Plugin setValues propagates when inputs empty', () => {
    const agentTree = {
      findNode: jest.fn().mockReturnValue({}),
      findParent: jest.fn().mockReturnValue({ config: { a: 5 } }),
      findPreviousSibling: jest.fn().mockReturnValue(null),
      updateStep: jest.fn(),
    } as any;

    const plugins = { agentTree } as any;
    const plugin = new Plugin({
      name: 'p',
      defaultValues: { config: { a: 1 } },
      propogation: { config: { type: 'lastParent' } },
      plugins,
      hooks: {},
    });

    const values = plugin.setValues('s1', {} as any);
    expect(values.config.a).toBe(5);
  });

  test('Plugin setValues works without propogation rules', () => {
    const agentTree = {
      findNode: jest.fn().mockReturnValue({ a: 3 }),
      findParent: jest.fn().mockReturnValue({}),
      findPreviousSibling: jest.fn().mockReturnValue({}),
      updateStep: jest.fn(),
    } as any;

    const plugin = new Plugin({
      name: 'p',
      defaultValues: { a: 1 },
      plugins: { agentTree } as any,
      hooks: {},
    });

    const values = plugin.setValues('s1', { a: 2 } as any);
    expect(values.a).toBe(2);
    expect(agentTree.updateStep).toHaveBeenCalled();
  });

  test('Plugin id falls back when randomUUID is missing', () => {
    jest.isolateModules(() => {
      const randomBytes = jest.fn(() => Buffer.from('abcd', 'hex'));
      jest.doMock('crypto', () => ({
        __esModule: true,
        randomUUID: undefined,
        randomBytes,
        default: { randomBytes },
      }));

      const { Plugin } = require('../src/PluginsCore');
      const agentTree = {
        findNode: jest.fn().mockReturnValue({}),
        findParent: jest.fn().mockReturnValue({}),
        findPreviousSibling: jest.fn().mockReturnValue({}),
        updateStep: jest.fn(),
      } as any;

      const plugin = new Plugin({
        name: 'p',
        defaultValues: { a: 1 },
        plugins: { agentTree } as any,
        hooks: {},
      });

      expect(typeof plugin.id).toBe('string');
    });
  });

  test('Plugin uses fallback when pick returns undefined', () => {
    jest.isolateModules(() => {
      jest.doMock('../src/Helpers', () => {
        const actual = jest.requireActual('../src/Helpers');
        return { ...actual, pick: jest.fn().mockReturnValue(undefined) };
      });

      const { Plugin } = require('../src/PluginsCore');
      const agentTree = {
        findNode: jest.fn().mockReturnValue({}),
        findParent: jest.fn().mockReturnValue({}),
        findPreviousSibling: jest.fn().mockReturnValue({}),
        updateStep: jest.fn(),
      } as any;

      const plugin = new Plugin({
        name: 'p',
        defaultValues: { a: 1 },
        plugins: { agentTree } as any,
        hooks: {},
      });

      expect(plugin.getValues('s1')).toEqual({ a: 1 });
      expect(plugin.getValuesParent('s1')).toEqual({ a: 1 });
    });
  });

  test('Plugin uses default hooks and inputs in setValues', () => {
    const agentTree = {
      findNode: jest.fn().mockReturnValue({}),
      findParent: jest.fn().mockReturnValue({}),
      findPreviousSibling: jest.fn().mockReturnValue({}),
      updateStep: jest.fn(),
    } as any;

    const plugin = new Plugin({
      name: 'p',
      defaultValues: { a: 1 },
      plugins: { agentTree } as any,
    } as any);

    const values = plugin.setValues('s1');
    expect(values).toEqual({ a: 1 });
  });

  test('Plugin setValues skips unknown propagation source', () => {
    const agentTree = {
      findNode: jest.fn().mockReturnValue({}),
      findParent: jest.fn().mockReturnValue({}),
      findPreviousSibling: jest.fn().mockReturnValue({}),
      updateStep: jest.fn(),
    } as any;

    const plugins = { agentTree } as any;
    const plugin = new Plugin({
      name: 'p',
      defaultValues: { a: 1 },
      propogation: { a: { type: 'unknown' as any } },
      plugins,
      hooks: {},
    });

    const values = plugin.setValues('s1', { a: 2 } as any);
    expect(values.a).toBe(2);
  });
});
