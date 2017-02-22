/* @flow */

import Context from './helpers/context';

export default class Schema<T> {
  /**
   * Unpack a structure from a buffer.
   */
  // eslint-disable-next-line no-unused-vars
  unpack(buffer: Buffer, offset: number = 0, context: Context): T {
    throw new Error('Unimplemented method');
  }

  /**
   * Determine the fixed size for this schema, return -1 if it has no fixed size.
   */
  size(): number {
    return 0;
  }

  /**
   * Return the size of an unpacked value
   */
  sizeOf(value: T): number { // eslint-disable-line no-unused-vars
    return this.size();
  }
}
