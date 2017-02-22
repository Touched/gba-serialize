/* @flow */

/* eslint-disable no-bitwise */

import Schema from './schema';
import invariant from '../util/invariant';

type BitfieldData = {
  [key: string]: mixed,
};

type BitfieldMeta = {
  name: string,
  bitWidth: number,
  reader: Buffer => number,
};

type BitfieldFields = Array<[string, number, ?bool]>;

export default class BitfieldSchema extends Schema<BitfieldData> {
  fields: Array<BitfieldMeta>;
  finalSize: number;

  constructor(fields: BitfieldFields) {
    super();

    let bitOffset = 0;

    this.fields = fields.map(([name, bitWidth, signed]) => {
      invariant(bitWidth > 0 && Number.isInteger(bitWidth), 'Bit width must be a positive integer');

      const byteStart = Math.floor(bitOffset / 8);
      const byteEnd = Math.ceil((bitOffset + bitWidth) / 8);
      const byteLength = byteEnd - byteStart;

      const shift = bitOffset % 8;
      const mask = ((1 << bitWidth) - 1) << shift;
      const signMask = 1 << (bitWidth - 1);

      bitOffset += bitWidth;

      const meta = {
        name,
        bitWidth,
        signed: !!signed,
      };

      if (signed) {
        return {
          ...meta,
          reader(buffer) {
            const value = (buffer.readUIntLE(byteStart, byteLength) & mask) >> shift;
            return (value & signMask) ? ~(value - 1) : value;
          },
        };
      }

      return {
        ...meta,
        reader(buffer) {
          return (buffer.readUIntLE(byteStart, byteLength) & mask) >> shift;
        },
      };
    });

    this.finalSize = Math.ceil(bitOffset / 8);
  }

  unpack(buffer: Buffer, offset: number = 0): BitfieldData {
    const slicedBuffer = buffer.slice(offset);

    return this.fields.reduce((result, { name, reader }) => ({
      ...result,
      [name]: reader(slicedBuffer),
    }), {});
  }

  alignment(): number {
    return 1;
  }

  size(): number {
    return this.finalSize;
  }
}
