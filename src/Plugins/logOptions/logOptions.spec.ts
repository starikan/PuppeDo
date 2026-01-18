import { Plugin } from '../../PluginsCore';

import pluginModule, { type PluginLogOptions, plugin, setValue } from './logOptions';

// Mock dependencies
jest.mock('../../PluginsCore');

const mockPlugin = Plugin as jest.MockedClass<typeof Plugin>;

describe('logOptions plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setValue function', () => {
    it('should set logOptions with logShowFlag based on PPD_LOG_IGNORE_HIDE_LOG', () => {
      const mockPluginInstance = {
        setValues: jest.fn(),
        getValues: jest.fn().mockReturnValue({
          logOptions: { textColor: 'red', logThis: true },
        }),
        getValuesParent: jest.fn().mockReturnValue({
          logOptions: { logChildren: false },
        }),
        plugins: {
          getPlugins: jest.fn().mockReturnValue({
            getValue: jest.fn().mockReturnValue({ PPD_LOG_IGNORE_HIDE_LOG: true }),
          }),
        },
      } as unknown as Plugin<PluginLogOptions>;

      const inputs = { logOptions: { textColor: 'red' } };
      const stepId = 'testStep';

      setValue.call(mockPluginInstance, { inputs, stepId });

      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, {
        logOptions: {
          logThis: true,
          textColor: 'red',
          logShowFlag: true,
        },
      });
    });

    it('should set logOptions with logShowFlag based on parent logChildren when PPD_LOG_IGNORE_HIDE_LOG is false', () => {
      const mockPluginInstance = {
        setValues: jest.fn(),
        getValues: jest.fn().mockReturnValue({
          logOptions: { textColor: 'red' },
        }),
        getValuesParent: jest.fn().mockReturnValue({
          logOptions: { logChildren: true },
        }),
        plugins: {
          getPlugins: jest.fn().mockReturnValue({
            getValue: jest.fn().mockReturnValue({ PPD_LOG_IGNORE_HIDE_LOG: false }),
          }),
        },
      } as unknown as Plugin<PluginLogOptions>;

      const inputs = { logOptions: { textColor: 'red' } };
      const stepId = 'testStep';

      setValue.call(mockPluginInstance, { inputs, stepId });

      expect(mockPluginInstance.setValues).toHaveBeenCalledWith(stepId, {
        logOptions: {
          logThis: true,
          textColor: 'red',
          logShowFlag: true,
        },
      });
    });

    it('should set logShowFlag to false when logThis is false', () => {
      const mockPluginInstance = {
        setValues: jest.fn(),
        getValues: jest.fn().mockReturnValue({
          logOptions: { textColor: 'red', logThis: false },
        }),
        getValuesParent: jest.fn().mockReturnValue({
          logOptions: { logChildren: true },
        }),
        plugins: {
          getPlugins: jest.fn().mockReturnValue({
            getValue: jest.fn().mockReturnValue({ PPD_LOG_IGNORE_HIDE_LOG: false }),
          }),
        },
      } as unknown as Plugin<PluginLogOptions>;

      setValue.call(mockPluginInstance, { inputs: { logOptions: { logThis: false } }, stepId: 'step' });

      expect(mockPluginInstance.setValues).toHaveBeenCalledWith('step', {
        logOptions: expect.objectContaining({ logShowFlag: false }),
      });
    });

    it('should fallback to true when parent logChildren is undefined', () => {
      const mockPluginInstance = {
        setValues: jest.fn(),
        getValues: jest.fn().mockReturnValue({
          logOptions: {},
        }),
        getValuesParent: jest.fn().mockReturnValue({
          logOptions: {},
        }),
        plugins: {
          getPlugins: jest.fn().mockReturnValue({
            getValue: jest.fn().mockReturnValue({ PPD_LOG_IGNORE_HIDE_LOG: false }),
          }),
        },
      } as unknown as Plugin<PluginLogOptions>;

      setValue.call(mockPluginInstance, { inputs: { logOptions: {} }, stepId: 'step' });

      expect(mockPluginInstance.setValues).toHaveBeenCalledWith('step', {
        logOptions: expect.objectContaining({ logShowFlag: true }),
      });
    });
  });

  describe('plugin function', () => {
    it('should create a Plugin instance with correct parameters', () => {
      const mockPlugins = {} as any;
      const mockPluginInstance = {};
      mockPlugin.mockImplementation(() => mockPluginInstance as any);

      const result = plugin(mockPlugins);

      expect(mockPlugin).toHaveBeenCalledWith({
        name: 'logOptions',
        defaultValues: {
          logOptions: {
            textColor: 'sane',
            backgroundColor: 'sane',
            logChildren: true,
            logShowFlag: true,
          },
        },
        hooks: {
          initValues: setValue,
          runLogic: setValue,
          resolveValues: setValue,
        },
        propogation: { logOptions: { type: 'lastParent', fieldsOnly: ['logChildren'] } },
        plugins: mockPlugins,
      });

      expect(result).toBe(mockPluginInstance);
    });
  });

  describe('pluginModule', () => {
    it('should export correct pluginModule', () => {
      expect(pluginModule.name).toBe('logOptions');
      expect(pluginModule.documentation).toBeDefined();
      expect(pluginModule.documentation.name).toBe('logOptions');
      expect(pluginModule.documentation.type).toBe('plugin');
      expect(pluginModule.documentation.propogation).toBe(true);
      expect(pluginModule.documentation.description.ru).toEqual([
        'Управление настройками логирования для отдельных агентов.',
      ]);
      expect(pluginModule.documentation.description.en).toEqual(['Control logging options for individual agents.']);
      expect(pluginModule.documentation.examples).toEqual([
        {
          test: 'src/Plugins/logOptions/logOptions.yaml',
          result: 'src.tests.e2e/snapshots/logOptions.log',
        },
      ]);
      expect(pluginModule.plugin).toBe(plugin);
      expect(pluginModule.order).toBe(700);
      expect(pluginModule.depends).toEqual(['argsRedefine']);
    });
  });

  describe('PluginLogOptions type', () => {
    it('should be defined', () => {
      const testValue: PluginLogOptions = {
        logOptions: {
          textColor: 'red',
          backgroundColor: 'blue',
          logChildren: true,
          logShowFlag: false,
        },
      };
      expect(testValue.logOptions.textColor).toBe('red');
    });
  });
});
