const _ = require('lodash');

const Environment = require('./env');

describe('Environment', () => {

  const envsIds = [];

  test('Constructor', () => {
    const { socket, envs, envsId } = Environment();
    envsIds.push(envsId);

    expect(socket).toBeDefined();
    expect(envs).toBeDefined();
    expect(envsId).toBeDefined();
  });
});
