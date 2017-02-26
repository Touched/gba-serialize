/* @flow */

import Schema from './schema';
import Context from './helpers/context';
import IntegerSchema from './integer';

export default class EnumSchema extends Schema<?string> {
  backingSchema: IntegerSchema;
  mapping: Map<number, string>;

  constructor(mapping: Map<number, string>, backingSchema: IntegerSchema) {
    super();
    this.backingSchema = backingSchema;
    this.mapping = mapping;
  }

  unpack(buffer: Buffer, offset: number = 0, context: Context = new Context()): ?string {
    const value = this.backingSchema.unpack(buffer, offset, context);
    return this.mapping.get(value) || null;
  }
}
