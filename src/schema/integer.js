/* @flow */

import { Schema, Value } from './schema';
import invariant from '../util/invariant';
import align from '../util/align';

export class IntegerValue extends Value {
  schema: IntegerSchema;
  data: number;

  size(): number {
    return this.schema.size;
  }
}

type IntegerSchemaOptions = {
  signed: bool,
};

export class IntegerSchema extends Schema {
  size: number;
  signed: bool;
  reader: (Buffer, number) => number;

  constructor(size: number, { signed = false }: IntegerSchemaOptions = {}) {
    super();
    invariant(size > 0 && Number.isInteger(size), 'Size must be a non-zero positive integer');
    this.size = size;
    this.signed = signed;

    const read = this.signed ? Buffer.prototype.readIntLE : Buffer.prototype.readUIntLE;
    this.reader = (buffer, offset) => read.call(buffer, offset, this.size);
  }

  unpack(buffer: Buffer, offset: number = 0): IntegerValue {
    super.unpack(buffer, offset);
    return new IntegerValue(this, this.reader(buffer, align(offset, this.size)));
  }

  alignment(): number {
    return this.size;
  }
}
