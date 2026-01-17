import { Arguments } from '../../Arguments';
import { Plugin } from '../../PluginsCore';

import pluginModule, { type PluginArgsRedefine, plugin, setValue } from './argsRedefine';

// Mock dependencies
jest.mock('../../Arguments');
jest.mock('../../PluginsCore');

const mockArguments = Arguments as jest.MockedClass<typeof Arguments>;
const mockPlugin = Plugin as jest.MockedClass<typeof Plugin>;

describe('argsRedefine plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Arguments constructor to return an object with args
    mockArguments.mockImplementation(() => ({ args: { PPD_LOG_EXTEND: true } }) as any);
  });

  describe('setValue function', () => {
    it('should call setValues with correct parameters', () => {
      const mockPluginInstance = {
        setValues: jest.fn(),
      } as unknown as Plugin<PluginArgsRedefine>;

      const inputs = { argsRedefine: { PPD_LOG_EXTEND: false } };
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
        name: 'argsRedefine',
        defaultValues: { argsRedefine: expect.any(Object) }, // Since Arguments().args is mocked
        propogation: { argsRedefine: { type: 'lastParent' } },
        hooks: {
          initValues: setValue,
          runLogic: setValue,
        },
        plugins: mockPlugins,
      });

      expect(result).toBe(mockPluginInstance);
    });

    it('should initialize defaultValues with Arguments().args', () => {
      const mockArgs = { PPD_LOG_EXTEND: true };
      mockArguments.mockImplementation(() => ({ args: mockArgs }) as any);

      plugin({} as any);

      expect(mockPlugin).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultValues: { argsRedefine: mockArgs },
        }),
      );
    });
  });

  describe('pluginModule', () => {
    it('should export correct pluginModule', () => {
      expect(pluginModule.name).toBe('argsRedefine');
      expect(pluginModule.documentation).toBeDefined();
      expect(pluginModule.documentation.name).toBe('argsRedefine');
      expect(pluginModule.documentation.type).toBe('plugin');
      expect(pluginModule.documentation.propogation).toBe(false);
      expect(pluginModule.documentation.description.ru).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Переопределение агрументов'),
          expect.stringContaining('ArgumentsType'),
        ]),
      );
      expect(pluginModule.documentation.description.en).toEqual(['TODO']);
      expect(pluginModule.documentation.examples).toEqual([
        {
          test: 'src/Plugins/argsRedefine/argsRedefine.yaml',
          result: 'src.tests.e2e/snapshots/argsRedefine.log',
        },
      ]);
      expect(pluginModule.plugin).toBe(plugin);
      expect(pluginModule.order).toBe(100);
      expect(pluginModule.depends).toEqual([]);
    });
  });

  describe('PluginArgsRedefine type', () => {
    it('should be defined', () => {
      // Type test: ensure PluginArgsRedefine is { argsRedefine: Partial<ArgumentsType> }
      const testValue: PluginArgsRedefine = { argsRedefine: { PPD_LOG_EXTEND: false } };
      expect(testValue.argsRedefine.PPD_LOG_EXTEND).toBe(false);
    });
  });
});
