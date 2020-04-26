import _ from 'lodash';

import { EventEmitter } from 'events';

import Singleton from './Singleton';

export default class Blocker extends Singleton {
  blocks: any;
  blockEmitter: any;

  constructor() {
    super();
    this.blocks = this.blocks || [];
    this.blockEmitter = this.blockEmitter || new EventEmitter();
    this.blockEmitter.setMaxListeners(1000);
  }

  push(data) {
    this.blocks.push(data);
  }

  refresh() {
    this.blocks = [];
  }

  setAll(blockArray) {
    if (_.isArray(blockArray)) {
      this.blocks = blockArray;
    } else {
      throw new Error('Blocks must be array');
    }
    this.blocks.forEach((v) => {
      this.blockEmitter.emit('updateBlock', v);
    });
  }

  setBlock(stepId, block) {
    this.blocks.forEach((v) => {
      if (v.stepId === stepId) {
        const emmitData = { ...v, ...{ block: Boolean(block) } };
        this.blockEmitter.emit('updateBlock', emmitData);
      }
    });
  }

  getBlock(stepId) {
    return (this.blocks.find((v) => v.stepId === stepId) || {}).block;
  }
}
