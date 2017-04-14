/* @flow */

import equal from 'deep-equal';
import Schema from './schema';
import Context from './helpers/context';

/**
 * A sentinel-terminated list.
 */
export default class ListSchema<T> extends Schema<Array<T>> {
  elementSchema: Schema<T>;
  sentinel: T;

  constructor(elementSchema: Schema<T>, sentinel: T) {
    super();
    this.elementSchema = elementSchema;
    this.sentinel = sentinel;
  }

  unpack(buffer: Buffer, offset: number = 0, context: Context = new Context()): Array<T> {
    const size = this.elementSchema.size();

    let listOffset = offset;

    const result = [];

    let value;
    for (;;) {
      value = this.elementSchema.unpack(buffer, listOffset, context);
      listOffset += size === -1 ? this.elementSchema.sizeOf(value) : size;

      if (equal(value, this.sentinel)) {
        break;
      }

      result.push(value);
    }

    return result;
  }

  size(): number {
    return -1;
  }

  sizeOf(value: Array<T>): number {
    if (this.elementSchema.size() === -1) {
      return value.reduce((sum, element) => sum + this.elementSchema.sizeOf(element), 0)
            + this.elementSchema.sizeOf(this.sentinel);
    }

    return (value.length + 1) * this.elementSchema.size();
  }
}
