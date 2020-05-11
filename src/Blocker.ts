import { EventEmitter } from 'events';

import Singleton from './Singleton';

type BlockType = {
  stepId: string;
  block: boolean;
  breadcrumbs?: string[];
};

export default class Blocker extends Singleton {
  blocks!: Array<BlockType>;
  blockEmitter!: EventEmitter;

  constructor() {
    super();
    this.blocks = this.blocks || [];
    this.blockEmitter = this.blockEmitter || new EventEmitter();
    this.blockEmitter.setMaxListeners(1000);
  }

  push(data: BlockType): void {
    this.blocks.push(data);
  }

  refresh(): void {
    this.blocks = [];
  }

  setAll(blockArray: Array<BlockType>) {
    this.blocks = blockArray;
    this.blocks.forEach((v) => {
      this.blockEmitter.emit('updateBlock', v);
    });
  }

  setBlock(stepId: string, block: boolean) {
    this.blocks.forEach((v) => {
      if (v.stepId === stepId) {
        const emmitData = { ...v, ...{ block: Boolean(block) } };
        this.blockEmitter.emit('updateBlock', emmitData);
      }
    });
  }

  getBlock(stepId: string): boolean {
    return Boolean((this.blocks.find((v) => v.stepId === stepId) || {}).block);
  }
}
