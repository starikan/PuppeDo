import { Plugin } from '../../PluginsCore';

import pluginModule, { type PluginDebug, plugin, setValue } from './debug';

// Mock dependencies
jest.mock('../../PluginsCore');

const mockPlugin = Plugin as jest.MockedClass<typeof Plugin>;

describe('debug plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setValue function', () => {
    it('should call setValues with correct parameters', () => {
      const mockPluginInstance = {
        setValues: jest.fn(),
      } as unknown as Plugin<PluginDebug>;

      const inputs = { debug: true };
      const stepId = 'testStep';

      setValue.call(mockPluginInstance, { inputs, stepId });

      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, inputs);
    });
  });

  describe('plugin function', () => {
    it('should create a Plugin instance with correct parameters', () => {
      const mockPlugins = {
        getPlugins: jest.fn().mockReturnValue({
          getValue: jest.fn().mockReturnValue({ argsRedefine: { PPD_DEBUG_MODE: true } }),
        }),
      } as any;
      const mockPluginInstance = {};
      mockPlugin.mockImplementation(() => mockPluginInstance as any);

      const result = plugin(mockPlugins);

      expect(mockPlugin).toHaveBeenCalledWith({
        name: 'debug',
        defaultValues: { debug: false },
        propogation: { debug: { type: 'lastParent' } },
        plugins: mockPlugins,
        hooks: {
          initValues: setValue,
          runLogic: setValue,
        },
        isActive: expect.any(Function),
      });

      expect(result).toBe(mockPluginInstance);
    });

    it('should have isActive function that returns PPD_DEBUG_MODE', () => {
      const mockPlugins = {
        getPlugins: jest.fn().mockReturnValue({
          getValue: jest.fn().mockReturnValue({ PPD_DEBUG_MODE: true }),
        }),
      } as any;
      mockPlugin.mockImplementation(() => ({}) as any);

      plugin(mockPlugins);

      const isActiveCall = mockPlugin.mock.calls[0][0].isActive;
      expect(isActiveCall({ inputs: {}, stepId: 'test' })).toBe(true);
    });

    it('should have isActive function that returns false when PPD_DEBUG_MODE is false', () => {
      const mockPlugins = {
        getPlugins: jest.fn().mockReturnValue({
          getValue: jest.fn().mockReturnValue({ PPD_DEBUG_MODE: false }),
        }),
      } as any;
      mockPlugin.mockImplementation(() => ({}) as any);

      plugin(mockPlugins);

      const isActiveCall = mockPlugin.mock.calls[0][0].isActive;
      expect(isActiveCall({ inputs: {}, stepId: 'test' })).toBe(false);
    });
  });

  describe('pluginModule', () => {
    it('should export correct pluginModule', () => {
      expect(pluginModule.name).toBe('debug');
      expect(pluginModule.documentation).toBeDefined();
      expect(pluginModule.documentation.name).toBe('debug');
      expect(pluginModule.documentation.type).toBe('plugin');
      expect(pluginModule.documentation.propogation).toBe(false);
      expect(pluginModule.documentation.description.ru).toEqual(['Дебаггер для остановки агента в нужном месте']);
      expect(pluginModule.documentation.description.en).toEqual([
        'Debugger for stopping the agent at the desired location',
      ]);
      expect(pluginModule.documentation.examples).toEqual([
        {
          test: 'src/Plugins/debug/debug.yaml',
          result: 'src.tests.e2e/snapshots/debug.log',
        },
      ]);
      expect(pluginModule.plugin).toBe(plugin);
      expect(pluginModule.depends).toEqual(['argsRedefine']);
    });
  });

  describe('PluginDebug type', () => {
    it('should be defined', () => {
      const testValue: PluginDebug = { debug: true };
      expect(testValue.debug).toBe(true);
    });
  });
});
