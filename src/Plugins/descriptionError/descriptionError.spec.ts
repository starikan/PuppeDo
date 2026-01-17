import { runScriptInContext } from '../../Helpers';
import { Plugin } from '../../PluginsCore';

import pluginModule, { type PluginDescriptionError, plugin, setValue } from './descriptionError';

// Mock dependencies
jest.mock('../../Helpers');
jest.mock('../../PluginsCore');

const mockRunScriptInContext = runScriptInContext as jest.MockedFunction<typeof runScriptInContext>;
const mockPlugin = Plugin as jest.MockedClass<typeof Plugin>;

describe('descriptionError plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setValue function', () => {
    it('should call setValues with correct parameters', () => {
      const mockPluginInstance = {
        setValues: jest.fn(),
      } as unknown as Plugin<PluginDescriptionError>;

      const inputs = { descriptionError: 'test error' };
      const stepId = 'testStep';

      setValue.call(mockPluginInstance, { inputs, stepId });

      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, inputs);
    });
  });

  describe('plugin function', () => {
    it('should create a Plugin instance with correct parameters', () => {
      const mockPlugins = {} as any;
      const mockPluginInstance = {};
      mockPlugin.mockImplementation(() => mockPluginInstance as any);

      const result = plugin(mockPlugins);

      expect(mockPlugin).toHaveBeenCalledWith({
        name: 'descriptionError',
        defaultValues: { descriptionError: '' },
        hooks: {
          initValues: setValue,
          runLogic: setValue,
          afterResults: expect.any(Function),
        },
        plugins: mockPlugins,
      });

      expect(result).toBe(mockPluginInstance);
    });

    it('should have afterResults hook that runs script and sets value', () => {
      const mockPluginInstance = {
        getValue: jest.fn().mockReturnValue('script'),
        setValues: jest.fn(),
      };
      mockPlugin.mockImplementation(() => mockPluginInstance as any);
      mockRunScriptInContext.mockReturnValue('new value');

      plugin({} as any);

      const afterResultsCall = mockPlugin.mock.calls[0][0].hooks.afterResults;
      const inputs = { some: 'data' };
      const stepId = 'testStep';

      afterResultsCall({ inputs, stepId });

      expect(mockPluginInstance.getValue).toHaveBeenCalledWith(stepId, 'descriptionError');
      expect(mockRunScriptInContext).toHaveBeenCalledWith('script', inputs, 'script');
      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, { descriptionError: 'new value' });
    });

    it('should not set value if runScriptInContext returns falsy', () => {
      const mockPluginInstance = {
        getValue: jest.fn().mockReturnValue('script'),
        setValues: jest.fn(),
      };
      mockPlugin.mockImplementation(() => mockPluginInstance as any);
      mockRunScriptInContext.mockReturnValue(null);

      plugin({} as any);

      const afterResultsCall = mockPlugin.mock.calls[0][0].hooks.afterResults;
      const inputs = { some: 'data' };
      const stepId = 'testStep';

      afterResultsCall({ inputs, stepId });

      expect(mockPluginInstance.setValues).not.toHaveBeenCalled();
    });

    it('should catch errors in runScriptInContext', () => {
      const mockPluginInstance = {
        getValue: jest.fn().mockReturnValue('script'),
        setValues: jest.fn(),
      };
      mockPlugin.mockImplementation(() => mockPluginInstance as any);
      mockRunScriptInContext.mockImplementation(() => {
        throw new Error('script error');
      });

      plugin({} as any);

      const afterResultsCall = mockPlugin.mock.calls[0][0].hooks.afterResults;
      const inputs = { some: 'data' };
      const stepId = 'testStep';

      expect(() => afterResultsCall({ inputs, stepId })).not.toThrow();
      expect(mockPluginInstance.setValues).not.toHaveBeenCalled();
    });
  });

  describe('pluginModule', () => {
    it('should export correct pluginModule', () => {
      expect(pluginModule.name).toBe('descriptionError');
      expect(pluginModule.documentation).toBeDefined();
      expect(pluginModule.documentation.name).toBe('descriptionError');
      expect(pluginModule.documentation.type).toBe('plugin');
      expect(pluginModule.documentation.propogation).toBe(false);
      expect(pluginModule.documentation.description.ru).toEqual(
        expect.arrayContaining([
          expect.stringContaining('При падении тестов'),
          expect.stringContaining('исполняемым в контексте данных'),
        ]),
      );
      expect(pluginModule.documentation.description.en).toEqual(['TODO']);
      expect(pluginModule.documentation.examples).toEqual([
        {
          test: 'src/Plugins/descriptionError/descriptionError.yaml',
          result: 'src.tests.e2e/snapshots/descriptionError.log',
        },
        {
          test: 'src/Plugins/descriptionError/descriptionErrorNested.yaml',
          result: 'src.tests.e2e/snapshots/descriptionErrorNested.log',
        },
        {
          test: 'src/Plugins/descriptionError/descriptionErrorDynamic.yaml',
          result: 'src.tests.e2e/snapshots/descriptionErrorDynamic.log',
        },
      ]);
      expect(pluginModule.plugin).toBe(plugin);
      expect(pluginModule.order).toBe(300);
      expect(pluginModule.depends).toEqual([]);
    });
  });

  describe('PluginDescriptionError type', () => {
    it('should be defined', () => {
      const testValue: PluginDescriptionError = { descriptionError: 'error message' };
      expect(testValue.descriptionError).toBe('error message');
    });
  });
});
