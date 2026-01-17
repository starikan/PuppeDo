import { runScriptInContext } from '../../Helpers';
import { Plugin } from '../../PluginsCore';

import pluginModule, { type PluginSkipSublingIfResult, plugin, setValue } from './skipSublingIfResult';

// Mock dependencies
jest.mock('../../Helpers');
jest.mock('../../PluginsCore');

const mockRunScriptInContext = runScriptInContext as jest.MockedFunction<typeof runScriptInContext>;
const mockPlugin = Plugin as jest.MockedClass<typeof Plugin>;

describe('skipSublingIfResult plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setValue function', () => {
    it('should call setValues with correct parameters', () => {
      const mockPluginInstance = {
        setValues: jest.fn(),
      } as unknown as Plugin<PluginSkipSublingIfResult>;

      const inputs = { skipSublingIfResult: 'true' };
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
        name: 'skipSublingIfResult',
        defaultValues: { skipSublingIfResult: '', skipMeBecausePrevSublingResults: false },
        propogation: { skipMeBecausePrevSublingResults: { type: 'lastSubling' } },
        hooks: {
          initValues: setValue,
          runLogic: setValue,
          afterRepeat: expect.any(Function),
        },
        plugins: mockPlugins,
      });

      expect(result).toBe(mockPluginInstance);
    });

    it('should have afterRepeat hook that evaluates skipSublingIfResult script', () => {
      const mockPluginInstance = {
        getValues: jest.fn().mockReturnValue({
          skipSublingIfResult: 'result > 5',
          skipMeBecausePrevSublingResults: false,
        }),
        setValues: jest.fn(),
      };
      mockPlugin.mockImplementation(() => mockPluginInstance as any);
      mockRunScriptInContext.mockReturnValue(true);

      plugin({} as any);

      const afterRepeatCall = mockPlugin.mock.calls[0][0].hooks.afterRepeat;
      const inputs = { result: 10 };
      const stepId = 'testStep';

      afterRepeatCall({ inputs, stepId });

      expect(mockPluginInstance.getValues).toHaveBeenCalledWith(stepId);
      expect(mockRunScriptInContext).toHaveBeenCalledWith('result > 5', inputs);
      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, {
        skipSublingIfResult: 'result > 5',
        skipMeBecausePrevSublingResults: true,
      });
    });

    it('should have afterRepeat hook that uses skipMeBecausePrevSublingResults if no script', () => {
      const mockPluginInstance = {
        getValues: jest.fn().mockReturnValue({
          skipSublingIfResult: '',
          skipMeBecausePrevSublingResults: true,
        }),
        setValues: jest.fn(),
      };
      mockPlugin.mockImplementation(() => mockPluginInstance as any);

      plugin({} as any);

      const afterRepeatCall = mockPlugin.mock.calls[0][0].hooks.afterRepeat;
      const inputs = {};
      const stepId = 'testStep';

      afterRepeatCall({ inputs, stepId });

      expect(mockRunScriptInContext).not.toHaveBeenCalled();
      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, {
        skipSublingIfResult: '',
        skipMeBecausePrevSublingResults: true,
      });
    });

    it('should catch errors in runScriptInContext', () => {
      const mockPluginInstance = {
        getValues: jest.fn().mockReturnValue({
          skipSublingIfResult: 'invalid script',
          skipMeBecausePrevSublingResults: false,
        }),
        setValues: jest.fn(),
      };
      mockPlugin.mockImplementation(() => mockPluginInstance as any);
      mockRunScriptInContext.mockImplementation(() => {
        throw new Error('script error');
      });

      plugin({} as any);

      const afterRepeatCall = mockPlugin.mock.calls[0][0].hooks.afterRepeat;
      const inputs = {};
      const stepId = 'testStep';

      expect(() => afterRepeatCall({ inputs, stepId })).not.toThrow();
      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, {
        skipSublingIfResult: 'invalid script',
        skipMeBecausePrevSublingResults: false,
      });
    });
  });

  describe('pluginModule', () => {
    it('should export correct pluginModule', () => {
      expect(pluginModule.name).toBe('skipSublingIfResult');
      expect(pluginModule.documentation).toBeDefined();
      expect(pluginModule.documentation.name).toBe('skipSublingIfResult');
      expect(pluginModule.documentation.type).toBe('plugin');
      expect(pluginModule.documentation.propogation).toBe(false);
      expect(pluginModule.documentation.description.ru).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Валидное JS выражение'),
          expect.stringContaining('На основании этого результата'),
        ]),
      );
      expect(pluginModule.documentation.description.en).toEqual(['TODO']);
      expect(pluginModule.documentation.examples).toEqual([
        {
          test: 'src/Plugins/skipSublingIfResult/skipSublingIfResult.yaml',
          result: 'src.tests.e2e/snapshots/skipSublingIfResult.log',
        },
      ]);
      expect(pluginModule.plugin).toBe(plugin);
      expect(pluginModule.order).toBe(400);
      expect(pluginModule.depends).toEqual([]);
    });
  });

  describe('PluginSkipSublingIfResult type', () => {
    it('should be defined', () => {
      const testValue: PluginSkipSublingIfResult = {
        skipSublingIfResult: 'result === "success"',
        skipMeBecausePrevSublingResults: false,
      };
      expect(testValue.skipSublingIfResult).toBe('result === "success"');
      expect(testValue.skipMeBecausePrevSublingResults).toBe(false);
    });
  });
});
