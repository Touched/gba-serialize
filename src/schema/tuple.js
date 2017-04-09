/* @flow */

import Schema from './schema';
import Context from './helpers/context';

export default class TupleSchema extends Schema<Array<any>> {
  elementSchemas: Array<Schema<any>>;

  constructor(elementSchemas: Array<Schema<any>>) {
    super();
    this.elementSchemas = elementSchemas;
  }

  unpack(buffer: Buffer, offset: number = 0, context: Context = new Context()): Array<any> {
    let tupleOffset = offset;

    return this.elementSchemas.map((elementSchema) => {
      const value = elementSchema.unpack(buffer, tupleOffset, context);

      const size = elementSchema.size();
      tupleOffset += size === -1 ? elementSchema.sizeOf(value) : size;

      return value;
    });
  }

  size(): number {
    return -1;
  }

  sizeOf(value: Array<any>): number {
    return this.elementSchemas.reduce((sum, elementSchema, i) => {
      const size = elementSchema.size();

      return sum + (size === -1 ? elementSchema.sizeOf(value[i]) : size);
    }, 0);
  }
}
