import { Plugin } from '../../PluginsCore';

import pluginModule, { type PluginContinueOnError, plugin, setValue } from './continueOnError';

// Mock dependencies
jest.mock('../../PluginsCore');

const mockPlugin = Plugin as jest.MockedClass<typeof Plugin>;

describe('continueOnError plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setValue function', () => {
    it('should set continueOnError to true when PPD_CONTINUE_ON_ERROR_ENABLED is true and inputs.continueOnError is true', () => {
      const mockPluginInstance = {
        plugins: {
          getPlugins: jest.fn().mockReturnValue({
            getValue: jest.fn().mockReturnValue({ PPD_CONTINUE_ON_ERROR_ENABLED: true }),
          }),
        },
        setValues: jest.fn(),
      } as unknown as Plugin<PluginContinueOnError>;

      const inputs = { continueOnError: true };
      const stepId = 'testStep';

      setValue.call(mockPluginInstance, { inputs, stepId });

      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, { continueOnError: true });
    });

    it('should set continueOnError to false when PPD_CONTINUE_ON_ERROR_ENABLED is false', () => {
      const mockPluginInstance = {
        plugins: {
          getPlugins: jest.fn().mockReturnValue({
            getValue: jest.fn().mockReturnValue({ PPD_CONTINUE_ON_ERROR_ENABLED: false }),
          }),
        },
        setValues: jest.fn(),
      } as unknown as Plugin<PluginContinueOnError>;

      const inputs = { continueOnError: true };
      const stepId = 'testStep';

      setValue.call(mockPluginInstance, { inputs, stepId });

      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, { continueOnError: false });
    });

    it('should set continueOnError to false when inputs.continueOnError is false', () => {
      const mockPluginInstance = {
        plugins: {
          getPlugins: jest.fn().mockReturnValue({
            getValue: jest.fn().mockReturnValue({ PPD_CONTINUE_ON_ERROR_ENABLED: true }),
          }),
        },
        setValues: jest.fn(),
      } as unknown as Plugin<PluginContinueOnError>;

      const inputs = { continueOnError: false };
      const stepId = 'testStep';

      setValue.call(mockPluginInstance, { inputs, stepId });

      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, { continueOnError: false });
    });
  });

  describe('plugin function', () => {
    it('should create a Plugin instance with correct parameters', () => {
      const mockPlugins = {} as any;
      const mockPluginInstance = {};
      mockPlugin.mockImplementation(() => mockPluginInstance as any);

      const result = plugin(mockPlugins);

      expect(mockPlugin).toHaveBeenCalledWith({
        name: 'continueOnError',
        defaultValues: { continueOnError: false },
        propogation: { continueOnError: { type: 'lastParent' } },
        hooks: {
          initValues: setValue,
          resolveValues: setValue,
        },
        plugins: mockPlugins,
      });

      expect(result).toBe(mockPluginInstance);
    });
  });

  describe('pluginModule', () => {
    it('should export correct pluginModule', () => {
      expect(pluginModule.name).toBe('continueOnError');
      expect(pluginModule.documentation).toBeDefined();
      expect(pluginModule.documentation.name).toBe('continueOnError');
      expect(pluginModule.documentation.type).toBe('plugin');
      expect(pluginModule.documentation.propogation).toBe(false);
      expect(pluginModule.documentation.description.ru).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Булевое значение'),
          expect.stringContaining('PPD_CONTINUE_ON_ERROR_ENABLED'),
          expect.stringContaining('continueOnError'),
        ]),
      );
      expect(pluginModule.documentation.description.en).toEqual(['TODO']);
      expect(pluginModule.documentation.examples).toEqual([
        {
          test: 'src/Plugins/continueOnError/continueOnError.yaml',
          result: 'src.tests.e2e/snapshots/continueOnError.log',
        },
      ]);
      expect(pluginModule.plugin).toBe(plugin);
      expect(pluginModule.order).toBe(200);
      expect(pluginModule.depends).toEqual(['argsRedefine']);
    });
  });

  describe('PluginContinueOnError type', () => {
    it('should be defined', () => {
      const testValue: PluginContinueOnError = { continueOnError: true };
      expect(testValue.continueOnError).toBe(true);
    });
  });
});
