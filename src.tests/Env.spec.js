const Environment = require('../dist/Environment.js').default;

describe('Environment', () => {
  test('Constructor', () => {
    const { socket, envs, envsId } = Environment();
    expect(socket).toBeDefined();
    expect(envs).toBeDefined();
    expect(envsId).toBeDefined();
  });
});
