/* @flow */

/* eslint-disable no-bitwise, no-plusplus */

import Schema from './schema';
import Context from './helpers/context';

type CompressedValue<T> = {
  compressedSize: number,
  size: number,
  data: T,
};

// $FlowFixMe Flow complains about implicitly returned undefined even though the code is unreachable
function decompress(src: Buffer): { decompressed: Buffer, size: number, compressedSize: number } {
  if (src.length < 4 || src[0] !== 0x10) {
    throw new Error();
  }

  const destSize = src[1] | (src[2] << 8) | (src[3] << 16);
  const dest = Buffer.alloc(destSize);

  let srcPos = 4;
  let destPos = 0;

  for (;;) {
    if (srcPos >= src.length) {
      throw new Error();
    }

    let flags = src[srcPos++];

    for (let i = 0; i < 8; i++) {
      if (flags & 0x80) {
        if (srcPos + 1 >= src.length) {
          throw new Error();
        }

        let blockSize = (src[srcPos] >> 4) + 3;
        const blockDistance = (((src[srcPos] & 0xF) << 8) | src[srcPos + 1]) + 1;

        srcPos += 2;

        const blockPos = destPos - blockDistance;

        // Some Ruby/Sapphire tilesets overflow.
        if (destPos + blockSize > destSize) {
          blockSize = destSize - destPos;
        }

        if (blockPos < 0) {
          throw new Error();
        }

        for (let j = 0; j < blockSize; j++) {
          dest[destPos++] = dest[blockPos + j];
        }
      } else {
        if (srcPos >= src.length || destPos >= destSize) {
          throw new Error();
        }

        dest[destPos++] = src[srcPos++];
      }

      if (destPos === destSize) {
        return {
          decompressed: dest,
          compressedSize: srcPos,
          size: destSize,
        };
      }

      flags <<= 1;
    }
  }
}

export default class CompressionSchema<T> extends Schema<CompressedValue<T>> {
  wrappedSchema: Schema<T>

  constructor(wrappedSchema: Schema<T>) {
    super();
    this.wrappedSchema = wrappedSchema;
  }

  unpack(buffer: Buffer, offset: number = 0, context: Context = new Context()): CompressedValue<T> {
    const { decompressed, compressedSize, size } = decompress(buffer.slice(offset));
    const data = this.wrappedSchema.unpack(decompressed, 0, context);

    return { compressedSize, size, data };
  }

  size(): number {
    return -1;
  }

  sizeOf({ compressedSize }: CompressedValue<T>): number {
    return compressedSize;
  }
}
