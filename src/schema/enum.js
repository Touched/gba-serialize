/* @flow */

import Schema from './schema';
import Context from './helpers/context';
import IntegerSchema from './integer';

export default class EnumSchema extends Schema<?string> {
  backingSchema: IntegerSchema;
  mapping: Map<number, string>;
  strict: boolean;

  constructor(mapping: Map<number, string>, backingSchema: IntegerSchema, strict: boolean = false) {
    super();
    this.backingSchema = backingSchema;
    this.mapping = mapping;
    this.strict = strict;
  }

  unpack(buffer: Buffer, offset: number = 0, context: Context = new Context()): ?string {
    const value = this.backingSchema.unpack(buffer, offset, context);
    const name = this.mapping.get(value);

    if (name) {
      return name;
    }

    if (this.strict) {
      throw new Error(`Invalid value for enum: ${value}`);
    }

    return null;
  }

  size(): number {
    return this.backingSchema.size();
  }
}
