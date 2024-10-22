// https://gist.github.com/ilfroloff/76fa55d041b6a1cd2dbe

const singleton = Symbol('singleton');

export default class Singleton {
  constructor() {
    const Class = new.target; // or this.constructor

    if (!Class[singleton]) {
      Class[singleton] = this;
    }

    // eslint-disable-next-line no-constructor-return
    return Class[singleton];
  }
}
