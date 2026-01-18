import Blocker from '../src/Blocker';

describe('Blocker', () => {
  beforeEach(() => {
    const blocker = new Blocker();
    blocker.reset();
  });

  test('push and getBlock', () => {
    const blocker = new Blocker();
    blocker.push({ stepId: 'step-1', block: true, breadcrumbs: ['a'] });

    expect(blocker.getBlock('step-1')).toBe(true);
    expect(blocker.getBlock('missing')).toBe(false);
  });

  test('reset clears blocks', () => {
    const blocker = new Blocker();
    blocker.push({ stepId: 'step-1', block: true });
    expect(blocker.getBlock('step-1')).toBe(true);

    blocker.reset();
    expect(blocker.getBlock('step-1')).toBe(false);
  });

  test('setAll replaces blocks and emits updates', () => {
    const blocker = new Blocker();
    const listener = jest.fn();
    blocker.blockEmitter.on('updateBlock', listener);

    blocker.setAll([
      { stepId: 'a', block: true },
      { stepId: 'b', block: false },
    ]);

    expect(blocker.getBlock('a')).toBe(true);
    expect(blocker.getBlock('b')).toBe(false);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test('setBlock emits only for matching step', () => {
    const blocker = new Blocker();
    const listener = jest.fn();
    blocker.blockEmitter.on('updateBlock', listener);

    blocker.setAll([
      { stepId: 'a', block: false },
      { stepId: 'b', block: false },
    ]);

    blocker.setBlock('a', true);
    blocker.setBlock('c', true);

    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener).toHaveBeenCalledWith({ stepId: 'a', block: true });
    expect(blocker.getBlock('a')).toBe(false);
  });
});
