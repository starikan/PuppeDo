import pkg from '../src/index';

describe('index exports', () => {
  test('exports core modules', () => {
    expect(pkg.run).toBeDefined();
    expect(pkg.errorHandler).toBeDefined();
    expect(pkg.FlowStructure).toBeDefined();
    expect(pkg.getAgent).toBeDefined();
    expect(pkg.getTest).toBeDefined();
    expect(pkg.AgentContent).toBeDefined();
    expect(pkg.Environment).toBeDefined();
    expect(pkg.Arguments).toBeDefined();
    expect(pkg.Blocker).toBeDefined();
    expect(pkg.Log).toBeDefined();
    expect(pkg.Singleton).toBeDefined();
    expect(pkg.paintString).toBeDefined();
    expect(pkg.blankSocket).toBeDefined();
    expect(pkg.argsDefault).toBeDefined();
    expect(pkg.runScriptInContext).toBeDefined();
    expect(pkg.Screenshot).toBeDefined();
    expect(pkg.Plugin).toBeDefined();
    expect(pkg.Plugins).toBeDefined();
  });
});
