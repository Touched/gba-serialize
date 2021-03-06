/* @flow */

import Schema from './schema';
import Context from './helpers/context';
import invariant from '../util/invariant';

export default class ArraySchema<T> extends Schema<Array<T>> {
  length: string | number;
  elementSchema: Schema<T>;

  constructor(elementSchema: Schema<T>, length: string | number) {
    super();
    this.elementSchema = elementSchema;
    this.length = length;
  }

  unpack(buffer: Buffer, offset: number = 0, context: Context = new Context()): Array<T> {
    const length = typeof this.length === 'number' ? this.length : context.get(this.length);

    invariant(
      typeof length === 'number' && Number.isInteger(length) && length >= 0,
      'Length must be a postive integer',
    );

    let arrayOffset = offset;

    return [...Array(length)].map(() => {
      const value = this.elementSchema.unpack(buffer, arrayOffset, context);

      const size = this.elementSchema.size();
      arrayOffset += size === -1 ? this.elementSchema.sizeOf(value) : size;

      return value;
    });
  }

  size(): number {
    return -1;
  }

  sizeOf(value: Array<T>): number {
    // Dynamically sized schemas can have elements of varying sizes
    if (this.elementSchema.size() === -1) {
      return value.reduce((sum, element) => sum + this.elementSchema.sizeOf(element), 0);
    }

    return value.length * this.elementSchema.size();
  }
}
