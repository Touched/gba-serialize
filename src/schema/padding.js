/* @flow */

import Schema from './schema';

export default class PaddingSchema extends Schema<?string> {
  length: number;

  constructor(length: number) {
    super();
    this.length = length;
  }

  unpack(): null {
    return null;
  }

  size(): number {
    return this.length;
  }
}
