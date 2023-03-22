import { Environment } from '../src/Environment';

describe('Environment', () => {
  test('Constructor', () => {
    const { socket, allRunners, envsId, logger } = new Environment().createEnv();

    expect(socket).toBeDefined();
    expect(allRunners).toBeDefined();
    expect(envsId).toBeDefined();
    expect(logger).toBeDefined();
    expect(logger.output).toBeDefined();
  });

  test('Getters', () => {
    const environment = new Environment();
    const { envsId } = environment.createEnv();

    expect(environment.getEnvInstance(envsId)).toBeDefined();
    expect(environment.getOutput(envsId)).toBeDefined();
    expect(environment.getSocket(envsId)).toBeDefined();
  });
});
