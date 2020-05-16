/* eslint-disable no-useless-constructor */
import Singleton from '../src/Singleton';

describe('Singleton', () => {
  test('Same instance', () => {
    class Klass extends Singleton {
      constructor() {
        super();
      }
    }

    const singleton = new Klass();
    const singleton2 = new Klass();

    expect(singleton).toEqual(singleton2);
  });
});
