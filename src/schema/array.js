/* @flow */

import Schema from './schema';
import Context from './helpers/context';
import invariant from '../util/invariant';

export default class ArraySchema<T> extends Schema<Array<T>> {
  lengthName: string;
  elementSchema: Schema<T>;

  constructor(elementSchema: Schema<T>, lengthName: string) {
    super();
    this.elementSchema = elementSchema;
    this.lengthName = lengthName;
  }

  unpack(buffer: Buffer, offset: number = 0, context: Context = new Context()): Array<T> {
    const length = context.get(this.lengthName);

    invariant(
      typeof length === 'number' && Number.isInteger(length) && length >= 0,
      'Length must be a postive integer',
    );

    let arrayOffset = offset;

    return [...Array(length)].map(() => {
      const value = this.elementSchema.unpack(buffer, arrayOffset, context);

      arrayOffset += this.elementSchema.size();

      return value;
    });
  }

  size(): number {
    return -1;
  }

  sizeOf(value: Array<T>): number {
    return value.reduce((sum, element) => sum + this.elementSchema.sizeOf(element), 0);
  }
}
