import { Plugin } from '../../PluginsCore';

import pluginModule, { type PluginFrame, plugin, setValue } from './frame';

// Mock dependencies
jest.mock('../../PluginsCore');

const mockPlugin = Plugin as jest.MockedClass<typeof Plugin>;

describe('frame plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setValue function', () => {
    it('should call setValues with correct parameters', () => {
      const mockPluginInstance = {
        setValues: jest.fn(),
      } as unknown as Plugin<PluginFrame>;

      const inputs = { frame: 'main' };
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
        name: 'frame',
        defaultValues: { frame: '' },
        propogation: { frame: { type: 'lastParent' } },
        hooks: {
          initValues: setValue,
          runLogic: setValue,
        },
        plugins: mockPlugins,
      });

      expect(result).toBe(mockPluginInstance);
    });
  });

  describe('pluginModule', () => {
    it('should export correct pluginModule', () => {
      expect(pluginModule.name).toBe('frame');
      expect(pluginModule.documentation).toBeDefined();
      expect(pluginModule.documentation.name).toBe('frame');
      expect(pluginModule.documentation.type).toBe('plugin');
      expect(pluginModule.documentation.propogation).toBe(true);
      expect(pluginModule.documentation.description.ru).toEqual([
        'Поддержка работы с фреймами. Позволяет указать целевой фрейм для выполнения действий.',
      ]);
      expect(pluginModule.documentation.description.en).toEqual([
        'Frame support. Allows to specify target frame for actions.',
      ]);
      expect(pluginModule.documentation.examples).toEqual([
        {
          test: 'src/Plugins/frame/frame.yaml',
          result: 'src.tests.e2e/snapshots/frame.log',
        },
      ]);
      expect(pluginModule.plugin).toBe(plugin);
      expect(pluginModule.order).toBe(150);
      expect(pluginModule.depends).toEqual([]);
    });
  });

  describe('PluginFrame type', () => {
    it('should be defined', () => {
      const testValue: PluginFrame = { frame: 'iframe1' };
      expect(testValue.frame).toBe('iframe1');
    });
  });
});
