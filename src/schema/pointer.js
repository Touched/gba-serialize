/* @flow */

import Schema from './schema';
import Context from './helpers/context';
import { Word } from './integer';
import addressToOffset from '../util/addressToOffset';

type PointerValue<T> = {
  address: number,
  target: T,
};

export default class PointerSchema<T> extends Schema<PointerValue<T>> {
  wrappedSchema: Schema<T>;

  constructor(wrappedSchema: Schema<T>) {
    super();
    this.wrappedSchema = wrappedSchema;
  }

  unpack(buffer: Buffer, offset: number = 0, context: Context = new Context()): PointerValue<T> {
    const address = Word.unpack(buffer, offset, context);

    return {
      address,
      target: this.wrappedSchema.unpack(buffer, addressToOffset(address), context),
    };
  }

  size() {
    return 4;
  }
}
