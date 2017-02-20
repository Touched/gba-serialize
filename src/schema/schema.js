/* @flow */

import invariant from '../util/invariant';

export class Value<T, U> {
  schema: T;
  thunk: ?() => U;
  data: U;

  constructor(schema: T, thunk: () => U) {
    this.schema = schema;
    this.thunk = thunk;
  }

  // eslint-disable-next-line class-methods-use-this
  size(): number {
    return 0;
  }

  value(): U {
    if (this.thunk) {
      this.data = this.thunk();
      this.thunk = null;
    }

    return this.data;
  }
}

export class Schema<T> {
  // eslint-disable-next-line class-methods-use-this
  unpack(buffer: Buffer, offset: number = 0): T {
    invariant(Buffer.isBuffer(buffer), 'Must pass in a buffer object.');
    invariant(offset >= 0 && Number.isInteger(offset), '`offset` must be a non-negative integer.');
  }

  // eslint-disable-next-line class-methods-use-this
  alignment(): number {
    return 0;
  }

  // eslint-disable-next-line class-methods-use-this
  size(): number {
    return 0;
  }
}

