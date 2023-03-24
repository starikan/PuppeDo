/* eslint-disable max-classes-per-file */
import crypto, { randomUUID } from 'crypto';
import { Arguments } from './Arguments';
import { PluginDocumentation, TestArgsType, TestExtendType } from './global.d';
import { pick } from './Helpers';
import Singleton from './Singleton';
import { Test } from './Test';

type Hooks = {
  initValues?: ({ initValues }: { initValues: TestExtendType }) => void;
  runLogic?: ({ inputs }: { inputs: TestExtendType }) => void;
  resolveInputs?: ({ inputs }: { inputs: TestExtendType }) => void;
  resolveArgs?: ({ args }: { args: TestArgsType }) => void;
  beforeFunctions?: ({ args }: { args: TestArgsType }) => void;
  afterResults?: ({ args, results }: { args: TestArgsType; results: Record<string, unknown> }) => void;
};

type PropogationsAndShares = {
  fromPrevSublingSimple: string[];
};

export interface PluginType<TValues> {
  name: string;
  hook: (name: keyof Hooks) => (_: unknown) => void;
  hooks: Hooks;
  propogationsAndShares?: PropogationsAndShares;
  values: TValues;
}

export type PluginFunction<T> = (allPlugins: Plugins) => PluginType<T>;

export type PluginModule<T> = {
  name: string;
  plugin: PluginFunction<T>;
  documentation: PluginDocumentation;
  argsPlugin?: Record<string, unknown>;
  order?: number;
};

// Storage of all scratch of plugins
export class PluginsFabric extends Singleton {
  private plugins: Record<string, PluginFunction<unknown>>;

  private documentation: Record<string, PluginDocumentation>;

  private orders: Record<string, number | null>;

  constructor(plugins: PluginModule<unknown>[] = [], reInit = false) {
    super();
    if (!this.plugins || reInit) {
      this.plugins = {};
      this.documentation = {};
      this.orders = {};

      for (const plugin of plugins) {
        this.addPlugin(plugin);
      }

      const { PPD_DEBUG_MODE } = new Arguments().args;

      if (PPD_DEBUG_MODE) {
        console.log(JSON.stringify(this.getPluginsOrder(), null, 2));
      }
    }
  }

  getAllPluginsScratch(): Record<string, PluginFunction<unknown>> {
    return this.plugins;
  }

  getDocs(): PluginDocumentation[] {
    return Object.values(this.documentation);
  }

  getPlugin(name: string): PluginFunction<unknown> {
    return this.plugins[name];
  }

  static registerPlugin(): void {
    // do nothing
  }

  addPlugin(plugin: PluginModule<unknown>): void {
    this.plugins[plugin.name] = plugin.plugin;
    this.documentation[plugin.name] = plugin.documentation;
    this.orders[plugin.name] = plugin.order || null;
  }

  getPluginsOrder(): Record<string, number | null> {
    const newOrders = {};
    const orders = this.getPluginsOrderedNames();
    for (const order of orders) {
      newOrders[order] = this.orders[order];
    }
    return newOrders;
  }

  getPluginsOrderedNames(): string[] {
    const valuesNull = Object.entries(this.orders)
      .filter((v) => !v[1])
      .map((v) => v[0]);

    const valuesOrdered = Object.entries(this.orders)
      .sort((a, b) => a[1] - b[1])
      .filter((v) => !!v[1])
      .map((v) => v[0]);
    return [...valuesOrdered, ...valuesNull];
  }
}

export class Plugins {
  private plugins: PluginType<unknown>[] = [];

  originTest: Test | null = null;

  blankHook: () => {
    // Blank
  };

  constructor(originTest?: Test) {
    const plugins = new PluginsFabric().getAllPluginsScratch();
    this.originTest = originTest ?? null;

    for (const plugin of Object.values(plugins)) {
      this.plugins.push(plugin(this));
    }
  }

  // TODO: 2022-10-18 S.Starodubov сделать так чтобы хук мог возвращать данные
  hook<T>(name: keyof Hooks, args: T): void {
    const pluginsNames = new PluginsFabric().getPluginsOrderedNames();
    for (const pluginName of pluginsNames) {
      this.plugins.find((v) => v.name === pluginName).hook(name)(args);
    }
  }

  // TODO: 2022-10-03 S.Starodubov async hook

  getValue<TValues>(pluginName: string): TValues {
    const { values } = this.plugins.find((v) => v.name === pluginName) as { values: TValues };
    return values;
  }

  getAllPropogatesAndSublings(type: keyof PropogationsAndShares): Record<string, unknown> {
    const propogationsAndShares = this.plugins.filter((v) => v.propogationsAndShares);
    const result = {};

    if (type === 'fromPrevSublingSimple') {
      const fromPrevSublingPlugins = propogationsAndShares.filter((v) => v.propogationsAndShares.fromPrevSublingSimple);
      fromPrevSublingPlugins.forEach((fromPrevSublingPlugin) => {
        fromPrevSublingPlugin.propogationsAndShares.fromPrevSublingSimple.forEach((v) => {
          result[v] = this.getValue(fromPrevSublingPlugin.name)[v];
        });
      });
    }

    return result;
  }
}

export class Plugin<T extends Record<keyof T, T[keyof T]>> implements PluginType<T> {
  // NodeJS > v14.17.0 randomUUID supports. https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
  id = randomUUID ? randomUUID() : crypto.randomBytes(20).toString('hex');

  name: string;

  defaultValues: T;

  values: T;

  allPlugins?: Plugins;

  hooks: Required<Hooks> = {
    initValues: ({ initValues }) => {
      const newValues = { ...this.defaultValues, ...pick(initValues, Object.keys(this.defaultValues)) };
      this.values = newValues as T;
    },
    runLogic: () => {
      // Blank
    },
    resolveInputs: () => {
      // Blank
    },
    resolveArgs: () => {
      // Blank
    },
    beforeFunctions: () => {
      // Blank
    },
    afterResults: () => {
      // Blank
    },
  };

  blankHook: () => {
    // Blank
  };

  propogationsAndShares?: PropogationsAndShares;

  constructor({
    name,
    defaultValues,
    propogationsAndShares,
    allPlugins,
    hooks = {},
  }: {
    name: string;
    defaultValues: T;
    propogationsAndShares?: PropogationsAndShares;
    allPlugins?: Plugins;
    hooks?: Hooks;
  }) {
    this.name = name;
    this.defaultValues = { ...defaultValues };
    this.values = { ...defaultValues };
    this.propogationsAndShares = propogationsAndShares;
    this.allPlugins = allPlugins;
    this.hooks = { ...this.hooks, ...hooks };
  }

  hook(name: keyof Hooks): (unknown) => void {
    try {
      if (Object.keys(this.hooks).includes(name)) {
        return this.hooks[name].bind(this);
      }
      return this.blankHook;
    } catch (error) {
      // eslint-disable-next-line no-debugger
      debugger;
    }
    return this.blankHook;
  }

  getValue(value: keyof T): T[keyof T] {
    return this.values[value];
  }

  setValues(values: Partial<T>): void {
    this.values = { ...this.values, ...values };
  }
}
