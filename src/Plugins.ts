/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { randomUUID } from 'crypto';
import { TestExtendType } from './global.d';
import { pick } from './Helpers';
import { PliginsFields } from './Plugins/index';
import Singleton from './Singleton';
import { Test } from './Test';

// type hooks = 'initValues' | 'runLogic' | 'resolveValues';

type Hooks = {
  initValues?: (initValues: TestExtendType & PliginsFields) => void;
  runLogic?: () => void;
  resolveValues?: (inputs: TestExtendType & PliginsFields) => void;
};

type PropogationsAndShares = {
  fromPrevSublingSimple: string[];
};

interface PluginType<TValues> {
  name: string;
  hook: (name: keyof Hooks) => (unknown) => void;
  hooks: Hooks;
  propogationsAndShares?: PropogationsAndShares;
  values: TValues;
}

type PluginFunction = (allPlugins?: Plugins) => PluginType<unknown>;

// Storage of all scratch of plugins
export class PluginsFabric extends Singleton {
  private plugins: Record<string, PluginFunction>;
  constructor(reInit = false) {
    super();
    if (!this.plugins || reInit) {
      this.plugins = {};
    }
  }

  getAllPluginsScratch(): Record<string, PluginFunction> {
    return this.plugins;
  }

  static getPlugin(): void {
    // do nothing
  }

  static registerPlugin(): void {
    // do nothing
  }

  addPlugin(name: string, newPlugin: PluginFunction): void {
    this.plugins[name] = newPlugin;
  }
}

export class Plugins {
  private plugins: PluginType<unknown>[] = [];

  originTest: Test;

  blankHook: () => {
    // Blank
  };

  constructor(originTest: Test) {
    const plugins = new PluginsFabric().getAllPluginsScratch();
    this.originTest = originTest;

    for (const plugin of Object.values(plugins)) {
      this.plugins.push(plugin.bind(this)());
    }
  }

  hook<T>(name: keyof Hooks, args: T): void {
    for (const plugin of this.plugins) {
      plugin.hook(name)(args);
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

export class Plugin<TValues> implements PluginType<TValues> {
  id = randomUUID();

  name: string;

  defaultValues?: TValues;

  values: TValues;

  allPlugins?: Plugins;

  hooks: Required<Hooks> = {
    initValues: (initValues: TestExtendType & PliginsFields) => {
      const newValues = { ...(this.defaultValues ?? {}), ...pick(initValues, Object.keys(this.defaultValues ?? {})) };
      this.values = newValues as TValues;
    },
    runLogic: () => {
      // Blank
    },
    resolveValues: () => {
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
    defaultValues?: TValues;
    propogationsAndShares?: PropogationsAndShares;
    allPlugins?: Plugins;
    hooks?: Hooks;
  }) {
    this.name = name;
    this.defaultValues = defaultValues;
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
}
