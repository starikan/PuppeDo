import { Environment } from '../src/Environment';

describe('Environment', () => {
  test('Constructor', () => {
    const { output, socket, envsPool, envsId, logger } = new Environment().createEnvs();

    expect(socket).toBeDefined();
    expect(envsPool).toBeDefined();
    expect(envsId).toBeDefined();
    expect(logger).toBeDefined();
    expect(output).toBeDefined();
  });

  test('Getters', () => {
    const envs = new Environment();
    const { envsId } = envs.createEnvs();

    expect(envs.getEnv(envsId)).toBeDefined();
    expect(envs.getOutput(envsId)).toBeDefined();
    expect(envs.getSocket(envsId)).toBeDefined();
  });
});
