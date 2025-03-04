import crypto, { randomUUID } from 'crypto';
import { Arguments } from './Arguments';
import {
  PluginDocumentation,
  PluginFunction,
  PluginHooks,
  PluginList,
  PluginModule,
  PluginType,
  TreeEntryType,
} from './global.d';
import { mergeObjects, pick } from './Helpers';
import Singleton from './Singleton';
import DefaultPlugins from './Plugins';
import { TestTree } from './TestTree';

/**
 * A class for managing plugins.
 * Extends Singleton.
 */
export class PluginsFabric extends Singleton {
  /**
   * An object to store plugin functions.
   * Key - plugin name, value - plugin function.
   */
  private plugins: Record<string, PluginFunction<unknown>>;

  /**
   * An object to store plugin documentation.
   * Key - plugin name, value - plugin documentation.
   */
  private documentation: Record<string, PluginDocumentation>;

  /**
   * An object to store the order of plugin execution.
   * Key - plugin name, value - order of execution or null.
   */
  private orders: Record<string, number | null>;

  /**
   * An object to store plugin dependencies.
   * Key - plugin name, value - array of dependent plugin names.
   */
  private depends: Record<string, string[]>;

  /**
   * Constructor.
   * @param plugins List of plugins for initialization.
   * @param reInit Flag for reinitialization.
   */
  constructor(plugins: PluginList = {}, reInit = false) {
    super();
    if (!this.plugins || reInit) {
      this.plugins = {};
      this.documentation = {};
      this.orders = {};
      this.depends = {};

      for (const plugin of Object.values(plugins)) {
        this.addPlugin(plugin.plugin, plugin.order);
      }

      this.normalizeOrders();

      this.checkDepends();

      const { PPD_DEBUG_MODE } = new Arguments().args;

      if (PPD_DEBUG_MODE) {
        console.log(JSON.stringify(this.getPluginsOrder(), null, 2));
      }
    }
  }

  /**
   * Returns all registered plugins.
   * @returns Object with functions of all registered plugins.
   */
  getAllPluginsScratch(): Record<string, PluginFunction<unknown>> {
    return this.plugins;
  }

  /**
   * Returns documentation for all registered plugins.
   * @returns Array of documentation for all registered plugins.
   */
  getDocs(): PluginDocumentation[] {
    return Object.values(this.documentation);
  }

  /**
   * Returns the function of a specific plugin.
   * @param name Plugin name.
   * @returns Plugin function.
   */
  getPlugin(name: string): PluginFunction<unknown> {
    return this.plugins[name];
  }

  /**
   * Registers a plugin.
   * If the plugin is passed as a string, it will be found in DefaultPlugins.
   * If the order is not passed, the order from the plugin will be used.
   * @param plugin Plugin or plugin name.
   * @param order Order of plugin execution.
   */
  addPlugin(plugin: PluginModule<unknown> | string, order?: number): void {
    const resolvPlugin = typeof plugin === 'string' ? DefaultPlugins[plugin] : plugin;
    this.plugins[resolvPlugin.name] = resolvPlugin.plugin;
    this.documentation[resolvPlugin.name] = resolvPlugin.documentation;
    this.depends[resolvPlugin.name] = resolvPlugin.depends;
    this.orders[resolvPlugin.name] = order ?? resolvPlugin.order ?? null;
  }

  /**
   * Returns an object with the order of plugin execution.
   * @returns Object with plugin names as keys and their orders as values.
   */
  getPluginsOrder(): Record<string, number | null> {
    const newOrders = {};
    const orders = this.getPluginsOrderedNames();
    for (const order of orders) {
      newOrders[order] = this.orders[order];
    }
    return newOrders;
  }

  /**
   * Returns the names of plugins in the order of their execution.
   * @returns Array of plugin names in the order of their execution.
   */
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

  /**
   * Checks plugin dependencies.
   * Throws an error if the order of plugin execution is not followed.
   */
  checkDepends(): void {
    const { depends, orders } = this;
    Object.keys(depends).forEach((plugin) => {
      if (!orders[plugin]) {
        throw new Error(`Plugin ${plugin} not found in the execution order`);
      }
      for (const dependency of depends[plugin]) {
        if (!orders[dependency] || orders[dependency] > orders[plugin]) {
          throw new Error(`Plugin ${dependency}, required for ${plugin}, not found or loaded after`);
        }
      }
    });
  }

  /**
   * Normalizes the order of plugin execution by assigning sequential numbers to plugins with undefined order.
   */
  normalizeOrders(): void {
    let maxOrder = Math.max(...Object.values(this.orders).filter((order) => order !== null));
    Object.keys(this.orders).forEach((plugin) => {
      if (this.orders[plugin] === null) {
        this.orders[plugin] = maxOrder + 1;
        maxOrder += 1;
      }
    });
  }
}

export class Plugins {
  private plugins: PluginType<unknown>[] = [];

  envsId: string;

  agentTree: TestTree;

  blankHook: () => {
    // Blank
  };

  constructor(envsId: string, agentTree: TestTree) {
    const plugins = new PluginsFabric().getAllPluginsScratch();

    this.envsId = envsId;
    this.agentTree = agentTree;

    for (const plugin of Object.values(plugins)) {
      this.plugins.push(plugin(this));
    }
  }

  // TODO: 2022-10-18 S.Starodubov сделать так чтобы хук мог возвращать данные
  // TODO: 2022-10-03 S.Starodubov async hook
  hook<T>(name: keyof PluginHooks, args: T): void {
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

  agentTree: TestTree;

  hooks: Required<PluginHooks> = {
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
    hooks?: PluginHooks;
  }) {
    this.name = name;
    this.defaultValues = { ...defaultValues };
    this.propogation = propogation;
    this.plugins = plugins;
    this.hooks = { ...this.hooks, ...hooks };

    this.agentTree = plugins.agentTree;
  }

  hook(name: keyof PluginHooks): (unknown) => void {
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
    const step = this.agentTree.findNode(stepId);

    return { ...this.defaultValues, ...(pick(step, Object.keys(this.defaultValues)) ?? {}) };
  }

  setValues(stepId: string, values: Partial<T> = {}): T {
    let newValues = mergeObjects<Partial<T>>([this.defaultValues, pick(values, Object.keys(this.defaultValues))]);

    try {
      const propagationSources = {
        lastParent: (): TreeEntryType => this.agentTree.findParent(stepId),
        lastSubling: (): TreeEntryType => this.agentTree.findPreviousSibling(stepId),
      };

      Object.entries(this.propogation ?? {}).forEach(([key, source]) => {
        if (!Object.keys(pick(values, [key])).length) {
          const sourceNode = propagationSources[source as keyof typeof propagationSources]();
          if (sourceNode) {
            const sourceValues = pick(sourceNode, [key]) as Partial<T>;
            newValues = { ...newValues, ...sourceValues };
          }
        }
      });

      this.agentTree.updateStep({ stepId, payload: newValues });
    } catch {
      //
    }

    return newValues as T;
  }
}
