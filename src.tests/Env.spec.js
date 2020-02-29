const Environment = require('../src/Environment.js');

describe('Environment', () => {
  test('Constructor', () => {
    const { socket, envs, envsId } = Environment();
    expect(socket).toBeDefined();
    expect(envs).toBeDefined();
    expect(envsId).toBeDefined();
  });
});