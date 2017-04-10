/* @flow */

import Schema from './schema';
import Context from './helpers/context';

export default class PaddingSchema extends Schema<?string> {
  length: number;

  constructor(length: number) {
    super();
    this.length = length;
  }

  unpack(buffer: Buffer, offset: number = 0, context: Context = new Context()): null {
    return null;
  }

  size(): number {
    return this.length;
  }
}
