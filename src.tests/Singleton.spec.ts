import Singleton from '../src/Singleton';

describe('Singleton', () => {
  test('Same instance', () => {
    class Klass extends Singleton {}

    const singleton = new Klass();
    const singleton2 = new Klass();

    expect(singleton).toEqual(singleton2);
  });
});
