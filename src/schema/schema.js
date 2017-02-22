/* @flow */

export default class Schema<T> {
  /**
   * Unpack a structure from a buffer.
   */
  unpack(buffer: Buffer, offset: number = 0): T { // eslint-disable-line no-unused-vars
    throw new Error('Unimplemented method');
  }

  /**
   * Determine the byte alignment for this schema.
   */
  alignment(): number {
    return 0;
  }

  /**
   * Determine the fixed size for this schema, return -1 if it has no fixed size.
   */
  size(): number {
    return 0;
  }
}
