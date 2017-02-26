/* @flow */

import Schema from './schema';
import Context from './helpers/context';
import { Word } from './integer';
import addressToOffset from '../util/addressToOffset';

export default class PointerSchema<T> extends Schema<T> {
  wrappedSchema: Schema<T>;

  constructor(wrappedSchema: Schema<T>) {
    super();
    this.wrappedSchema = wrappedSchema;
  }

  unpack(buffer: Buffer, offset: number = 0, context: Context = new Context()): T {
    const address = Word.unpack(buffer, offset, context);
    return this.wrappedSchema.unpack(buffer, addressToOffset(address), context);
  }

  size() {
    return 4;
  }
}
