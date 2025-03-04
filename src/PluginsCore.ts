import crypto, { randomUUID } from 'crypto';
import { Arguments } from './Arguments';
import { PluginDocumentation, PluginList, TestArgsType } from './global.d';
import { mergeObjects, pick } from './Helpers';
import Singleton from './Singleton';
import DefaultPlugins from './Plugins';
import { Environment } from './Environment';

type Hooks = {
  initValues?: ({
    inputs,
    envsId,
    stepId,
  }: {
    inputs: Record<string, unknown>;
    envsId?: string;
    stepId?: string;
  }) => void;
  runLogic?: ({
    inputs,
    envsId,
    stepId,
  }: {
    inputs: Record<string, unknown>;
    envsId?: string;
    stepId?: string;
  }) => void;
  resolveValues?: ({ inputs, stepId }: { inputs: Record<string, unknown>; stepId?: string }) => void;
  beforeFunctions?: ({ args, stepId }: { args: TestArgsType; stepId?: string }) => void;
  afterResults?: ({
    args,
    results,
    stepId,
  }: {
    args: TestArgsType;
    results: Record<string, unknown>;
    stepId?: string;
  }) => void;
  afterRepeat?: ({
    args,
    allData,
    results,
    stepId,
  }: {
    args: TestArgsType;
    allData: Record<string, unknown>;
    results: Record<string, unknown>;
    stepId?: string;
  }) => void;
};

export interface PluginType<T> {
  name: string;
  hook: (name: keyof Hooks) => (_: unknown) => void;
  hooks: Hooks;
  propogation: Partial<Record<keyof T, 'lastParent' | 'lastSubling'>>;
  getValue?: (stepId: string, value?: keyof T) => T[keyof T];
  getValues?: (stepId: string) => T;
  setValues?: (stepId: string, values?: Partial<T>) => T;
}

export type PluginFunction<T> = (plugins: Plugins) => PluginType<T>;

export type PluginModule<T> = {
  name: string;
  plugin: PluginFunction<T>;
  documentation: PluginDocumentation;
  order?: number;
};

// Storage of all scratch of plugins
export class PluginsFabric extends Singleton {
  private plugins: Record<string, PluginFunction<unknown>>;

  private documentation: Record<string, PluginDocumentation>;

  private orders: Record<string, number | null>;

  constructor(plugins: PluginList = {}, reInit = false) {
    super();
    if (!this.plugins || reInit) {
      this.plugins = {};
      this.documentation = {};
      this.orders = {};

      for (const plugin of Object.values(plugins)) {
        this.addPlugin(plugin.plugin, plugin.order);
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

  addPlugin(plugin: PluginModule<unknown> | string, order?: number): void {
    const resolvPlugin = typeof plugin === 'string' ? DefaultPlugins[plugin] : plugin;
    this.plugins[resolvPlugin.name] = resolvPlugin.plugin;
    this.documentation[resolvPlugin.name] = resolvPlugin.documentation;
    this.orders[resolvPlugin.name] = order ?? resolvPlugin.order ?? null;
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

  envsId: string;

  blankHook: () => {
    // Blank
  };

  constructor(envsId: string) {
    const plugins = new PluginsFabric().getAllPluginsScratch();

    this.envsId = envsId;

    for (const plugin of Object.values(plugins)) {
      this.plugins.push(plugin(this));
    }
  }

  // TODO: 2022-10-18 S.Starodubov сделать так чтобы хук мог возвращать данные
  // TODO: 2022-10-03 S.Starodubov async hook
  hook<T>(name: keyof Hooks, args: T): void {
    const pluginsNames = new PluginsFabric().getPluginsOrderedNames();
    for (const pluginName of pluginsNames) {
      this.plugins.find((v) => v.name === pluginName).hook(name)(args);
    }
  }

  getPlugins<TPlugin = unknown>(pluginName: string): PluginType<TPlugin> {
    const plugin = this.plugins.find((v) => v.name === pluginName) as PluginType<TPlugin>;
    if (!plugin) {
      throw new Error(`Can't find plugin ${pluginName}`);
    }
    return plugin;
  }
}

export class Plugin<T extends Record<keyof T, T[keyof T]>> implements PluginType<T> {
  // NodeJS > v14.17.0 randomUUID supports. https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
  id = randomUUID ? randomUUID() : crypto.randomBytes(20).toString('hex');

  name: string;

  defaultValues: T;

  plugins: Plugins;

  hooks: Required<Hooks> = {
    initValues: ({ inputs, stepId }) => {
      this.setValues(stepId, inputs as Partial<T>);
    },
    runLogic: ({ inputs, stepId }) => {
      this.setValues(stepId, inputs as Partial<T>);
    },
    resolveValues: () => {
      // Blank
    },
    beforeFunctions: () => {
      // Blank
    },
    afterResults: () => {
      // Blank
    },
    afterRepeat: () => {
      // Blank
    },
  };

  blankHook: () => {
    // Blank
  };

  propogation: Partial<Record<keyof T, 'lastParent' | 'lastSubling'>>;

  constructor({
    name,
    defaultValues,
    propogation,
    plugins,
    hooks = {},
  }: {
    name: string;
    defaultValues: T;
    propogation?: Partial<Record<keyof T, 'lastParent' | 'lastSubling'>>;
    plugins: Plugins;
    hooks?: Hooks;
  }) {
    this.name = name;
    this.defaultValues = { ...defaultValues };
    this.propogation = propogation;
    this.plugins = plugins;
    this.hooks = { ...this.hooks, ...hooks };
  }

  hook(name: keyof Hooks): (unknown) => void {
    try {
      if (Object.keys(this.hooks).includes(name)) {
        return this.hooks[name].bind(this);
      }
      return this.blankHook;
    } catch (error) {
      console.log(error);
      // eslint-disable-next-line no-debugger
      debugger;
    }
    return this.blankHook;
  }

  getValue(stepId: string, value: keyof T): T[keyof T] {
    return this.getValues(stepId)[value];
  }

  getValues(stepId: string): T {
    const { testTree } = new Environment().getEnvInstance(this.plugins.envsId);
    const step = testTree.findNode(stepId);

    return { ...this.defaultValues, ...(pick(step, Object.keys(this.defaultValues)) ?? {}) };
  }

  setValues(stepId: string, values: Partial<T> = {}): T {
    let newValues = mergeObjects<Partial<T>>([this.defaultValues, pick(values, Object.keys(this.defaultValues))]);

    try {
      // todo: как то кэшировать в плагинс
      const { testTree } = new Environment().getEnvInstance(this.plugins.envsId);

      // Если нет ключей на входе смотрим на родителя, если это нужно
      const lastParent = Object.entries(this.propogation ?? {})
        .filter((v) => v[1] === 'lastParent')
        .map((v) => v[0]);
      if (lastParent.length && !Object.keys(pick(values, lastParent)).length) {
        const stepParent = testTree.findParent(stepId);
        const valuesParent = stepParent ? (pick(stepParent, lastParent) as T) : {};
        newValues = { ...newValues, ...valuesParent };
      }

      const lastSubling = Object.entries(this.propogation ?? {})
        .filter((v) => v[1] === 'lastSubling')
        .map((v) => v[0]);
      if (lastSubling.length && !Object.keys(pick(values, lastSubling)).length) {
        const stepPrevSubling = testTree.findPreviousSibling(stepId);
        // if (this.name === 'descriptionError') console.log('stepPrevSubling', stepPrevSubling.stepId);
        const valuesPrevSubling = stepPrevSubling ? (pick(stepPrevSubling, lastSubling) as T) : {};
        newValues = { ...newValues, ...valuesPrevSubling };
      }

      testTree.updateStep({ stepId, payload: newValues });
    } catch {
      //
    }

    return newValues as T;
  }
}
