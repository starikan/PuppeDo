import { Environment } from '../../Environment';
import { Plugin } from '../../PluginsCore';

import pluginModule, { type PluginEngineSupports, plugin, setValue } from './engineSupports';

// Mock dependencies
vi.mock('../../Environment');
vi.mock('../../PluginsCore');

const mockEnvironment = Environment as MockedClass<typeof Environment>;
const mockPlugin = Plugin as MockedClass<typeof Plugin>;

describe('engineSupports plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnvironment.mockImplementation(function () {
      return {
        getEngine: vi.fn(),
        getEnvInstance: vi.fn(() => ({
          allRunners: {
            getRunnerByName: vi.fn(() => ({
              getRunnerData: vi.fn(() => ({
                browser: { engine: 'webkit' },
              })),
            })),
          },
        })),
        getCurrent: vi.fn(() => ({ name: 'testRunner' })),
      } as any;
    });
  });

  describe('setValue function', () => {
    it('should call setValues with correct parameters', () => {
      const mockPluginInstance = {
        setValues: vi.fn(),
      } as unknown as Plugin<PluginEngineSupports>;

      const inputs = { engineSupports: ['chromium'] };
      const stepId = 'testStep';

      setValue.call(mockPluginInstance, { inputs, stepId });

      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, inputs);
    });
  });

  describe('plugin function', () => {
    it('should create a Plugin instance with correct parameters', () => {
      const mockPlugins = { envsId: 'testEnv' } as any;
      const mockPluginInstance = {};
      mockPlugin.mockImplementation(function () {
        return mockPluginInstance as any;
      });

      const result = plugin(mockPlugins);

      expect(mockPlugin).toHaveBeenCalledWith({
        name: 'engineSupports',
        defaultValues: { engineSupports: [] },
        hooks: {
          initValues: setValue,
          runLogic: setValue,
          resolveValues: expect.any(Function),
        },
        plugins: mockPlugins,
      });

      expect(result).toBe(mockPluginInstance);
    });

    it('should have resolveValues hook that does nothing if engineSupports is empty', () => {
      const mockPluginInstance = {
        setValues: vi.fn().mockReturnValue({ engineSupports: [] }),
      };
      mockPlugin.mockImplementation(function () {
        return mockPluginInstance as any;
      });

      plugin({} as any);

      const resolveValuesCall = mockPlugin.mock.calls[0][0].hooks.resolveValues;
      const inputs = {};
      const stepId = 'testStep';

      expect(() => resolveValuesCall({ inputs, stepId })).not.toThrow();
    });

    it('should have resolveValues hook that throws error if engine not supported', () => {
      const mockPluginInstance = {
        setValues: vi.fn().mockReturnValue({ engineSupports: ['webkit'] }),
      };
      mockPlugin.mockImplementation(function () {
        return mockPluginInstance as any;
      });

      const mockEnvInstance = {
        allRunners: {
          getRunnerByName: vi.fn().mockReturnValue({
            getRunnerData: vi.fn().mockReturnValue({ browser: { engine: 'chromium' } }),
          }),
        },
      };
      const mockCurrent = { name: 'testRunner' };
      mockEnvironment.mockImplementation(function () {
        return {
          getEnvInstance: vi.fn().mockReturnValue(mockEnvInstance),
          getCurrent: vi.fn().mockReturnValue(mockCurrent),
        } as any;
      });

      plugin({ envsId: 'test' } as any);

      const resolveValuesCall = mockPlugin.mock.calls[0][0].hooks.resolveValues;
      const inputs = {};
      const stepId = 'testStep';

      expect(() => resolveValuesCall({ inputs, stepId })).toThrow(
        "Current engine: 'chromium' not supported with this agent. You need to use: webkit",
      );
    });

    it('should have resolveValues hook that does nothing if engine is supported', () => {
      const mockPluginInstance = {
        setValues: vi.fn().mockReturnValue({ engineSupports: ['chromium'] }),
      };
      mockPlugin.mockImplementation(function () {
        return mockPluginInstance as any;
      });

      const mockEnvInstance = {
        allRunners: {
          getRunnerByName: vi.fn().mockReturnValue({
            getRunnerData: vi.fn().mockReturnValue({ browser: { engine: 'chromium' } }),
          }),
        },
      };
      const mockCurrent = { name: 'testRunner' };
      mockEnvironment.mockImplementation(function () {
        return {
          getEnvInstance: vi.fn().mockReturnValue(mockEnvInstance),
          getCurrent: vi.fn().mockReturnValue(mockCurrent),
        } as any;
      });

      plugin({ envsId: 'test' } as any);

      const resolveValuesCall = mockPlugin.mock.calls[0][0].hooks.resolveValues;
      const inputs = {};
      const stepId = 'testStep';

      expect(() => resolveValuesCall({ inputs, stepId })).not.toThrow();
    });

    it('should not throw when engine is undefined', () => {
      const mockPluginInstance = {
        setValues: vi.fn().mockReturnValue({ engineSupports: ['chromium'] }),
      };
      mockPlugin.mockImplementation(function () {
        return mockPluginInstance as any;
      });

      const mockEnvInstance = {
        allRunners: {
          getRunnerByName: vi.fn().mockReturnValue({
            getRunnerData: vi.fn().mockReturnValue({ browser: {} }),
          }),
        },
      };
      const mockCurrent = { name: 'testRunner' };
      mockEnvironment.mockImplementation(function () {
        return {
          getEnvInstance: vi.fn().mockReturnValue(mockEnvInstance),
          getCurrent: vi.fn().mockReturnValue(mockCurrent),
        } as any;
      });

      plugin({ envsId: 'test' } as any);

      const resolveValuesCall = mockPlugin.mock.calls[0][0].hooks.resolveValues;
      const inputs = {};
      const stepId = 'testStep';

      expect(() => resolveValuesCall({ inputs, stepId })).not.toThrow();
    });

    it('should not throw when runner is undefined', () => {
      const mockPluginInstance = {
        setValues: vi.fn().mockReturnValue({ engineSupports: ['chromium'] }),
      };
      mockPlugin.mockImplementation(function () {
        return mockPluginInstance as any;
      });

      const mockEnvInstance = {
        allRunners: {
          getRunnerByName: vi.fn().mockReturnValue(undefined),
        },
      };
      const mockCurrent = { name: 'testRunner' };
      mockEnvironment.mockImplementation(function () {
        return {
          getEnvInstance: vi.fn().mockReturnValue(mockEnvInstance),
          getCurrent: vi.fn().mockReturnValue(mockCurrent),
        } as any;
      });

      plugin({ envsId: 'test' } as any);

      const resolveValuesCall = mockPlugin.mock.calls[0][0].hooks.resolveValues;
      const inputs = {};
      const stepId = 'testStep';

      expect(() => resolveValuesCall({ inputs, stepId })).not.toThrow();
    });

    it('should use default runner name when current is empty', () => {
      const mockPluginInstance = {
        setValues: vi.fn().mockReturnValue({ engineSupports: [] }),
      };
      mockPlugin.mockImplementation(function () {
        return mockPluginInstance as any;
      });

      const mockEnvInstance = {
        allRunners: {
          getRunnerByName: vi.fn().mockReturnValue(undefined),
        },
      };
      mockEnvironment.mockImplementation(function () {
        return {
          getEnvInstance: vi.fn().mockReturnValue(mockEnvInstance),
          getCurrent: vi.fn().mockReturnValue({}),
        } as any;
      });

      plugin({ envsId: 'test' } as any);

      const resolveValuesCall = mockPlugin.mock.calls[0][0].hooks.resolveValues;

      expect(() => resolveValuesCall({ inputs: {}, stepId: 'testStep' })).not.toThrow();
    });
  });

  describe('pluginModule', () => {
    it('should export correct pluginModule', () => {
      expect(pluginModule.name).toBe('engineSupports');
      expect(pluginModule.documentation).toBeDefined();
      expect(pluginModule.documentation.name).toBe('engineSupports');
      expect(pluginModule.documentation.type).toBe('plugin');
      expect(pluginModule.documentation.propogation).toBe(false);
      expect(pluginModule.documentation.description.ru).toEqual([
        'Плагин для проверки поддержки браузерных движков, с помощью которых работают агенты',
      ]);
      expect(pluginModule.documentation.description.en).toEqual([
        'Plugin for checking browser engine support, with which agents work',
      ]);
      expect(pluginModule.documentation.examples).toEqual([
        {
          test: 'src/Plugins/engineSupports/engineSupports.yaml',
          result: 'src.tests.e2e/snapshots/engineSupports.log',
        },
      ]);
      expect(pluginModule.plugin).toBe(plugin);
      expect(pluginModule.order).toBe(500);
      expect(pluginModule.depends).toEqual([]);
    });
  });

  it('should be defined', () => {
    const testValue: PluginEngineSupports = { engineSupports: ['webkit' as any] };
    expect(testValue.engineSupports).toEqual(['webkit']);
  });
});
