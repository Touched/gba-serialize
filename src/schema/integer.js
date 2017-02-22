/* @flow */

import Schema from './schema';
import invariant from '../util/invariant';
import align from '../util/align';

type IntegerSchemaOptions = {
  signed: bool,
};

export default class IntegerSchema extends Schema<number> {
  width: number;
  signed: bool;
  reader: (Buffer, number) => number;

  constructor(size: number, { signed = false }: IntegerSchemaOptions = {}) {
    super();
    invariant(size > 0 && Number.isInteger(size), 'Size must be a non-zero positive integer');
    this.width = size;
    this.signed = signed;

    const read = this.signed ? Buffer.prototype.readIntLE : Buffer.prototype.readUIntLE;
    this.reader = (buffer, offset) => read.call(buffer, offset, this.size());
  }

  unpack(buffer: Buffer, offset: number = 0): number {
    return this.reader(buffer, align(offset, this.size()));
  }

  alignment(): number {
    return this.size();
  }

  size(): number {
    return this.width;
  }
}

export const Word = new IntegerSchema(4);
export const SignedWord = new IntegerSchema(4, { signed: true });
export const HalfWord = new IntegerSchema(2);
export const SignedHalfWord = new IntegerSchema(2, { signed: true });
export const Byte = new IntegerSchema(1);
export const SignedByte = new IntegerSchema(1, { signed: true });
