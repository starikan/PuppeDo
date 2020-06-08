import { checkIf } from '../src/Test';

describe('Test', () => {
  test('checkIf', async () => {
    const log = (): void => {};

    await expect(checkIf('1 == a', 'if', log)).rejects.toThrow(new Error("Can't evaluate 1 == a = 'a is not defined'"));

    expect(await checkIf('1 == 1', 'if', log)).toBe(false);
    expect(await checkIf('1 != 1', 'if', log)).toBe(true);

    await expect(checkIf('1 == 1', 'errorIf', log)).rejects.toThrow(
      new Error("Test stopped with expr errorIf = '1 == 1'"),
    );
    expect(await checkIf('1 != 1', 'errorIf', log)).toBe(false);

    await expect(checkIf('1 == 1', 'errorIfResult', log)).rejects.toThrow(
      new Error("Test stopped with expr errorIfResult = '1 == 1'"),
    );
    expect(await checkIf('1 != 1', 'errorIfResult', log)).toBe(false);
  });
});
