import Environment from '../src/Environment';

describe('Environment', () => {
  test('Constructor', () => {
    const { socket, envsPool, envsId, logger } = Environment();
    expect(socket).toBeDefined();
    expect(envsPool).toBeDefined();
    expect(envsId).toBeDefined();
    expect(logger).toBeDefined();
  });
});
