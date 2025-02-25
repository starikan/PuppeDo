import crypto, { randomUUID } from 'crypto';
import { Arguments } from './Arguments';
import { PluginDocumentation, PluginList, TestArgsType } from './global.d';
import { pick } from './Helpers';
import Singleton from './Singleton';
import { Test } from './Test';
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
  resolveValues?: ({ inputs }: { inputs: Record<string, unknown> }) => void;
  beforeFunctions?: ({ args }: { args: TestArgsType }) => void;
  afterResults?: ({ args, results }: { args: TestArgsType; results: Record<string, unknown> }) => void;
};

type PropogationsAndShares = {
  fromPrevSublingSimple?: string[];
};

export interface PluginType<TValues> {
  name: string;
  hook: (name: keyof Hooks) => (_: unknown) => void;
  hooks: Hooks;
  propogationsAndShares?: PropogationsAndShares;
  propogation: 'lastParent' | 'lastSubling';
  values: TValues;
  getValue?: (value?: keyof TValues) => TValues[keyof TValues];
  setValues?: (values?: Partial<TValues>) => TValues;
  originAgent?: Test;
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

  originAgent: Test;

  blankHook: () => {
    // Blank
  };

  constructor(originAgent: Test) {
    const plugins = new PluginsFabric().getAllPluginsScratch();
    this.originAgent = originAgent;

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
    const { values } = this.get<TValues>(pluginName);
    return values;
  }

  get<TPlugin = unknown>(pluginName: string): PluginType<TPlugin> {
    const plugin = this.plugins.find((v) => v.name === pluginName) as PluginType<TPlugin>;
    if (!plugin) {
      throw new Error(`Can't find plugin ${pluginName}`);
    }
    return plugin;
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

  plugins?: Plugins;

  originAgent?: Test;

  hooks: Required<Hooks> = {
    initValues: ({ inputs }) => {
      this.setValues(inputs as Partial<T>);
    },
    runLogic: ({ inputs }) => {
      this.setValues(inputs as Partial<T>);
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
  };

  blankHook: () => {
    // Blank
  };

  propogationsAndShares?: PropogationsAndShares;

  propogation: 'lastParent' | 'lastSubling';

  constructor({
    name,
    defaultValues,
    propogationsAndShares,
    propogation,
    originAgent,
    plugins,
    hooks = {},
    getValue,
    setValues,
  }: {
    name: string;
    defaultValues: T;
    propogationsAndShares?: PropogationsAndShares;
    propogation?: 'lastParent' | 'lastSubling';
    originAgent?: Test;
    plugins?: Plugins;
    hooks?: Hooks;
    getValue?: (value?: keyof T) => T[keyof T];
    setValues?: (values?: Partial<T>) => T;
  }) {
    this.name = name;
    this.defaultValues = { ...defaultValues };
    this.values = { ...defaultValues };
    this.propogationsAndShares = propogationsAndShares;
    this.propogation = propogation;
    this.plugins = plugins;
    this.originAgent = originAgent;
    this.hooks = { ...this.hooks, ...hooks };
    this.getValue = getValue ?? this.getValue;
    this.setValues = setValues ?? this.setValues;
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

  getValue(value: keyof T): T[keyof T] {
    return { ...this.defaultValues, ...(this.values ?? {}) }[value];
  }

  getValues(): T {
    return { ...this.defaultValues, ...(this.values ?? {}) };
  }

  setValues(values: Partial<T> = {}): T {
    const newValues = {
      ...this.defaultValues,
      ...(this.values ?? {}),
      ...pick(values, Object.keys(this.defaultValues)),
    };
    this.values = newValues as T;

    try {
      // todo: несерьезно
      // @ts-ignore
      const { envsId, stepId } = values;
      const { testTree } = new Environment().getEnvInstance(envsId);

      // Если нет ключей на фходе смотрим на родителя, если это нужно
      if (this.propogation === 'lastParent' && !Object.keys(pick(values, Object.keys(this.defaultValues))).length) {
        const stepParent = testTree.findParent(stepId);
        const valuesParent = stepParent ? (pick(stepParent, Object.keys(this.defaultValues)) as T) : {};
        this.values = { ...this.values, ...valuesParent };
      }

      testTree.updateStep({ stepId, payload: this.values });
    } catch (error) {
      // debugger;
    }

    return this.values;
  }
}
