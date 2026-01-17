import { resolveAliases } from '../../Helpers';
import { Plugin } from '../../PluginsCore';

import pluginModule, { type PluginOptions, plugin, setValue } from './options';

// Mock dependencies
jest.mock('../../Helpers');
jest.mock('../../PluginsCore');

const mockResolveAliases = resolveAliases as jest.MockedFunction<typeof resolveAliases>;
const mockPlugin = Plugin as jest.MockedClass<typeof Plugin>;

describe('options plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolveAliases.mockReturnValue({});
  });

  describe('setValue function', () => {
    it('should merge options with parent options and resolved aliases', () => {
      const mockPluginInstance = {
        setValues: jest.fn(),
        getValues: jest.fn().mockReturnValue({
          options: { key1: 'value1' },
          allowOptions: ['opt1'],
        }),
        getValuesParent: jest.fn().mockReturnValue({
          options: { key2: 'value2' },
        }),
      } as unknown as Plugin<PluginOptions>;

      mockResolveAliases.mockReturnValue({ key3: 'value3' });

      const inputs = { options: { key1: 'newValue1' } };
      const stepId = 'testStep';

      setValue.call(mockPluginInstance, { inputs, stepId });

      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, inputs);
      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, {
        options: {
          key1: 'value1',
          key3: 'value3',
          key2: 'value2',
        },
        allowOptions: ['opt1'],
      });
      expect(mockResolveAliases).toHaveBeenCalledWith('options', inputs);
    });
  });

  describe('plugin function', () => {
    it('should create a Plugin instance with correct parameters', () => {
      const mockPlugins = {} as any;
      const mockPluginInstance = {};
      mockPlugin.mockImplementation(() => mockPluginInstance as any);

      const result = plugin(mockPlugins);

      expect(mockPlugin).toHaveBeenCalledWith({
        name: 'options',
        defaultValues: { options: {}, allowOptions: [] },
        propogation: { options: { type: 'lastParent' } },
        hooks: {
          initValues: setValue,
          runLogic: setValue,
          resolveValues: setValue,
        },
        plugins: mockPlugins,
      });

      expect(result).toBe(mockPluginInstance);
    });
  });

  describe('pluginModule', () => {
    it('should export correct pluginModule', () => {
      expect(pluginModule.name).toBe('options');
      expect(pluginModule.documentation).toBeDefined();
      expect(pluginModule.documentation.name).toBe('options');
      expect(pluginModule.documentation.type).toBe('plugin');
      expect(pluginModule.documentation.propogation).toBe(true);
      expect(pluginModule.documentation.description.ru).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Плагин для управления опциями'),
          expect.stringContaining('Опции наследуются'),
        ]),
      );
      expect(pluginModule.documentation.description.en).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Plugin for managing agent options'),
          expect.stringContaining('Options are inherited'),
        ]),
      );
      expect(pluginModule.documentation.examples).toEqual([
        {
          test: 'src/Plugins/options/options.yaml',
          result: 'src.tests.e2e/snapshots/options.log',
        },
      ]);
      expect(pluginModule.plugin).toBe(plugin);
      expect(pluginModule.order).toBe(150);
      expect(pluginModule.depends).toEqual([]);
    });
  });

  describe('PluginOptions type', () => {
    it('should be defined', () => {
      const testValue: PluginOptions = {
        options: { timeout: 5000 },
        allowOptions: ['timeout', 'retries'],
      };
      expect(testValue.options.timeout).toBe(5000);
      expect(testValue.allowOptions).toEqual(['timeout', 'retries']);
    });
  });
});
