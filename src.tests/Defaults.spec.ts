import { EXTEND_BLANK_AGENT, resolveOptions } from '../src/Defaults';
import { blankSocket } from '../src/Helpers';

describe('Defaults', () => {
  test('EXTEND_BLANK_AGENT returns base structure', () => {
    const agent = EXTEND_BLANK_AGENT();

    expect(agent.envsId).toBe('');
    expect(agent.stepId).toBe('');
    expect(agent.breadcrumbs).toEqual([]);
    expect(agent.socket).toBe(blankSocket);
  });

  test('resolveOptions uses defaults when config missing', () => {
    const originalRequire = (global as any).__non_webpack_require__;
    (global as any).__non_webpack_require__ = jest.fn(() => {
      throw new Error('missing');
    });

    const options = resolveOptions({
      debug: true,
      closeAllEnvs: false,
      closeProcess: false,
      stdOut: false,
      globalConfigFile: 'custom.js',
    });

    expect(options.debug).toBe(true);
    expect(options.closeAllEnvs).toBe(false);
    expect(options.closeProcess).toBe(false);
    expect(options.stdOut).toBe(false);
    expect(options.globalConfigFile).toBe('custom.js');

    (global as any).__non_webpack_require__ = originalRequire;
  });

  test('resolveOptions merges config and overrides', () => {
    const originalRequire = (global as any).__non_webpack_require__;
    (global as any).__non_webpack_require__ = jest.fn().mockReturnValue({
      pluginsList: { pluginA: { enabled: true } },
      loggerPipes: [{ transformer: jest.fn(), formatter: jest.fn(), exporter: jest.fn() }],
      argsConfig: { PPD_LOG_DISABLED: true },
    });

    const options = resolveOptions({
      pluginsList: { pluginB: { plugin: 'mock' } },
      loggerPipes: [{ transformer: jest.fn(), formatter: jest.fn(), exporter: jest.fn() }],
      argsConfig: { PPD_DEBUG_MODE: true },
      debug: false,
    });

    expect(options.pluginsList).toEqual(
      expect.objectContaining({
        pluginA: { enabled: true },
        pluginB: { plugin: 'mock' },
      }),
    );
    expect(options.loggerPipes.length).toBe(7);
    expect(options.argsConfig).toEqual({ PPD_LOG_DISABLED: true });
    expect(options.debug).toBe(false);

    (global as any).__non_webpack_require__ = originalRequire;
  });

  test('resolveOptions handles null config', () => {
    const originalRequire = (global as any).__non_webpack_require__;
    (global as any).__non_webpack_require__ = jest.fn().mockReturnValue(null);

    const options = resolveOptions({});

    expect(options.pluginsList).toBeDefined();
    expect(options.loggerPipes.length).toBeGreaterThan(0);

    (global as any).__non_webpack_require__ = originalRequire;
  });
});
