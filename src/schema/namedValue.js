/* @flow */

import Schema from './schema';
import Context from './helpers/context';

export default class NamedValueSchema<T> extends Schema<T> {
  name: string;
  wrappedSchema: Schema<T>;

  constructor(name: string, wrappedSchema: Schema<T>) {
    super();
    this.name = name;
    this.wrappedSchema = wrappedSchema;
  }

  unpack(buffer: Buffer, offset: number = 0, context: Context = new Context()): T {
    const value = this.wrappedSchema.unpack(buffer, offset, context);
    context.set(this.name, value);
    return value;
  }

  size(): number {
    return this.wrappedSchema.size();
  }

  sizeOf(value: T): number {
    return this.wrappedSchema.sizeOf(value);
  }
}
