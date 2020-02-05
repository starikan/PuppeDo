const _ = require('lodash');

const Log = require('./Log');

describe('Log', () => {

  let logger;

  beforeEach(()=>{
    logger = new Log();
  })
  test('Constructor', () => {
    expect(logger.envs).toBeDefined();
    expect(logger.socket).toBeDefined();
    expect(logger.envsId).toBeDefined();
    expect(logger.binded).toBeDefined();
  });
});
