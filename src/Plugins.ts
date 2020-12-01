interface PluginType {
  name: string;
}

const plugins: PluginType[] = [];

export const getAllPlugins = (): { plugins: PluginType[]; names: string[] } => {
  const names = plugins.map((v) => v.name);
  return { plugins, names };
};

export const getPlugin = (): void => {
  // do nothing
};

export const registerPlugin = (): void => {
  // do nothing
};

export default class Plugin implements PluginType {
  name!: string;

  constructor(name: string) {
    this.name = name;
  }
}
