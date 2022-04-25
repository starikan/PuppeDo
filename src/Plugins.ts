/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { TestExtendType } from './global.d';
import { pick } from './Helpers';
import Singleton from './Singleton';
import { Test } from './Test';

// type hooks = 'initValues' | 'runLogic' | 'resolveValues';

type Hooks = {
  initValues?: (initValues: TestExtendType) => void;
  runLogic?: () => void;
  resolveValues?: (inputs: TestExtendType) => void;
};

interface PluginType {
  name: string;
  hook: (name: keyof Hooks) => (unknown) => void;
  hooks: Hooks;
}

type PluginFunction = (allPlugins: Plugins) => PluginType;

// Storage of all scratch of plugins
export class PluginsFabric extends Singleton {
  private plugins: Record<string, PluginFunction>;
  constructor(reInit = false) {
    super();
    if (!this.plugins || reInit) {
      this.plugins = {};
    }
  }

  getAllPlugins(): Record<string, PluginFunction> {
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
  private plugins: PluginType[] = [];

  originTest: Test;

  blankHook: () => {
    // Blank
  };

  constructor(originTest: Test) {
    const plugins = new PluginsFabric().getAllPlugins();
    this.originTest = originTest;

    for (const plugin of Object.values(plugins)) {
      this.plugins.push(plugin(this));
    }
  }

  hook(name: keyof Hooks): (args: unknown) => void {
    // debugger;
    return async (args: unknown) => {
      for (const plugin of this.plugins) {
        await plugin.hook(name)(args);
      }
    };
  }

  getValue(pluginName: string, valueName: string): unknown {
    // debugger;
    return this.plugins.find((v) => v.name === pluginName)?.[valueName] ?? this.originTest[valueName] ?? null;
  }
}

export class Plugin<TValues> implements PluginType {
  name: string;

  defaultValues: TValues;

  values: TValues;

  allPlugins: Plugins;

  hooks: Required<Hooks> = {
    initValues: (initValues: TestExtendType) => {
      const newValues = { ...this.defaultValues, ...pick(initValues, Object.keys(this.defaultValues)) };
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

  constructor({
    name,
    defaultValues,
    hooks,
    allPlugins,
  }: {
    name: string;
    defaultValues: TValues;
    hooks: Hooks;
    allPlugins: Plugins;
  }) {
    this.name = name;
    this.defaultValues = defaultValues;
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
      debugger;
    }
    return this.blankHook;
  }
}
