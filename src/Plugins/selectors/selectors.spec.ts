import { resolveAliases } from '../../Helpers';
import { Plugin } from '../../PluginsCore';

import pluginModule, { type PluginSelectors, plugin, setValue } from './selectors';

// Mock dependencies
jest.mock('../../Helpers');
jest.mock('../../PluginsCore');

const mockResolveAliases = resolveAliases as jest.MockedFunction<typeof resolveAliases>;
const mockPlugin = Plugin as jest.MockedClass<typeof Plugin>;

describe('selectors plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolveAliases.mockReturnValue({});
  });

  describe('setValue function', () => {
    it('should merge selectors with parent selectors and resolved aliases', () => {
      const mockPluginInstance = {
        setValues: jest.fn(),
        getValues: jest.fn().mockReturnValue({
          selectors: { sel1: '.class1' },
        }),
        getValuesParent: jest.fn().mockReturnValue({
          selectors: { sel2: '.class2' },
        }),
      } as unknown as Plugin<PluginSelectors>;

      mockResolveAliases.mockReturnValue({ sel3: '.class3' });

      const inputs = { selectors: { sel1: '.newClass1' } };
      const stepId = 'testStep';

      setValue.call(mockPluginInstance, { inputs, stepId });

      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, inputs);
      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, {
        selectors: {
          sel1: '.class1',
          sel3: '.class3',
          sel2: '.class2',
        },
      });
      expect(mockResolveAliases).toHaveBeenCalledWith('selectors', inputs);
    });
  });

  describe('plugin function', () => {
    it('should create a Plugin instance with correct parameters', () => {
      const mockPlugins = {} as any;
      const mockPluginInstance = {};
      mockPlugin.mockImplementation(() => mockPluginInstance as any);

      const result = plugin(mockPlugins);

      expect(mockPlugin).toHaveBeenCalledWith({
        name: 'selectors',
        defaultValues: { selectors: {} },
        propogation: { selectors: { type: 'lastParent' } },
        hooks: {
          initValues: setValue,
          runLogic: setValue,
          beforeFunctions: expect.any(Function),
        },
        plugins: mockPlugins,
      });

      expect(result).toBe(mockPluginInstance);
    });

    it('should have beforeFunctions hook that sets values', () => {
      const mockPluginInstance = {
        setValues: jest.fn(),
      };
      mockPlugin.mockImplementation(() => mockPluginInstance as any);

      plugin({} as any);

      const beforeFunctionsCall = mockPlugin.mock.calls[0][0].hooks.beforeFunctions;
      const inputs = { selectors: { test: 'value' } };
      const stepId = 'testStep';

      beforeFunctionsCall.call(mockPluginInstance, { inputs, stepId });

      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, inputs);
    });
  });

  describe('pluginModule', () => {
    it('should export correct pluginModule', () => {
      expect(pluginModule.name).toBe('selectors');
      expect(pluginModule.documentation).toBeDefined();
      expect(pluginModule.documentation.name).toBe('selectors');
      expect(pluginModule.documentation.type).toBe('plugin');
      expect(pluginModule.documentation.propogation).toBe(true);
      expect(pluginModule.documentation.description.ru).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Плагин для управления селекторами'),
          expect.stringContaining('Селекторы доступны'),
        ]),
      );
      expect(pluginModule.documentation.description.en).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Plugin for managing selectors'),
          expect.stringContaining('Selectors are available'),
        ]),
      );
      expect(pluginModule.documentation.examples).toEqual([
        {
          test: 'src/Plugins/selectors/selectors.yaml',
          result: 'src.tests.e2e/snapshots/selectors.log',
        },
      ]);
      expect(pluginModule.plugin).toBe(plugin);
      expect(pluginModule.order).toBe(170);
      expect(pluginModule.depends).toEqual([]);
    });
  });

  describe('PluginSelectors type', () => {
    it('should be defined', () => {
      const testValue: PluginSelectors = {
        selectors: { button: '#submit', input: 'input[name="email"]' },
      };
      expect(testValue.selectors.button).toBe('#submit');
    });
  });
});
