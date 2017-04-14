/* @flow */

import Schema from './schema';
import Context from './helpers/context';
import Charmap from '../string/charmap';
import buildDecoder from '../string/decode';

type Encoding = 'ascii';

type StringValue = {
  encoding: Encoding | Charmap,
  terminated: boolean,
  value: string,
  size: number,
};

export default class StringSchema extends Schema<StringValue> {
  terminated: boolean;
  length: number | string;
  encoding: Encoding | Charmap;
  decoder: (Buffer, n: ?number) => [number, string];

  constructor(encoding: Encoding | Charmap = 'ascii', length: ?(number | string)) {
    super();

    this.encoding = encoding;

    if (length) {
      this.length = length;
      this.terminated = false;
    } else {
      this.length = -1;
      this.terminated = true;
    }

    if (encoding instanceof Charmap) {
      this.decoder = buildDecoder(encoding);
    }
  }

  unpack(buffer: Buffer, offset: number = 0, context: Context = new Context()): StringValue {
    const { encoding, terminated } = this;
    const length = typeof this.length === 'number' ? this.length :
                   parseInt(context.get(this.length), 10);

    if (typeof encoding === 'string') {
      if (terminated) {
        const stringBuffer = buffer.slice(offset);

        return {
          encoding,
          terminated,
          value: stringBuffer.toString(encoding).split('\0')[0],
          size: stringBuffer.length,
        };
      }

      const stringBuffer = buffer.slice(offset, offset + length);

      return {
        encoding,
        terminated,
        value: stringBuffer.toString(encoding),
        size: stringBuffer.length,
      };
    }

    const [size, value] = this.decoder(buffer.slice(offset), terminated ? null : length);

    return {
      encoding,
      terminated,
      value,
      size,
    };
  }

  size(): number {
    return typeof this.length === 'number' ? this.length : -1;
  }

  sizeOf({ size }: StringValue): number {
    return size;
  }
}
