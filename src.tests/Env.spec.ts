import { Environment } from '../src/Environment';

describe('Environment', () => {
  test('Constructor', () => {
    const { output, socket, env, envsId, logger } = new Environment().createEnv();

    expect(socket).toBeDefined();
    expect(env).toBeDefined();
    expect(envsId).toBeDefined();
    expect(logger).toBeDefined();
    expect(output).toBeDefined();
  });

  test('Getters', () => {
    const envs = new Environment();
    const { envsId } = envs.createEnv();

    expect(envs.getEnvAllInstance(envsId)).toBeDefined();
    expect(envs.getOutput(envsId)).toBeDefined();
    expect(envs.getSocket(envsId)).toBeDefined();
  });
});
