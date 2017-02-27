/* @flow */

import Schema from './schema';
import IntegerSchema, { Byte } from './integer';

export default class BooleanSchema extends Schema<bool> {
  backingSchema: IntegerSchema;

  constructor(backingSchema: IntegerSchema) {
    super();
    this.backingSchema = backingSchema;
  }

  unpack(buffer: Buffer, offset: number = 0): bool {
    const value = this.backingSchema.unpack(buffer, offset);
    return !!value;
  }

  size(): number {
    return this.backingSchema.size();
  }
}

export const Boolean = new BooleanSchema(Byte);
