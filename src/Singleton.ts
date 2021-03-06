// https://gist.github.com/ilfroloff/76fa55d041b6a1cd2dbe

const singleton = Symbol('singleton');

export default class Singleton {
  // static get instance() {
  //   if (!this[singleton]) {
  //     this[singleton] = new this();
  //   }

  //   return this[singleton];
  // }

  constructor() {
    const Class = new.target; // or this.constructor

    if (!Class[singleton]) {
      Class[singleton] = this;
    }

    return Class[singleton];
  }
}
