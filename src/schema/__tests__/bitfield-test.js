/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import BitfieldSchema from '../bitfield';

describe('Schema: Bitfields', () => {
  const bitfield = new BitfieldSchema([
    ['a', 7],
    ['b', 9],
    ['c', 3, true],
    ['d', 5],
  ]);

  const bitfieldWithPadding = new BitfieldSchema([
    ['a', 7],
    ['b', 9],
    [null, 3],
    ['c', 5],
  ]);

  it('unpacks a bitfield', () => {
    const data = new Buffer([0, 0x8a, 5, 0xa, 0]);

    expect(bitfield.unpack(data, 1)).to.deep.equal({
      a: 10,
      b: 11,
      c: 2,
      d: 1,
    });
  });

  it('has a size derived from the sum of the bit widths', () => {
    expect(bitfield.size()).to.equal(3);
  });

  it('can handle signed values', () => {
    const data = new Buffer([0x8a, 5, 0xc, 0]);

    expect(bitfield.unpack(data)).to.deep.equal({
      a: 10,
      b: 11,
      c: -4,
      d: 1,
    });
  });


  it('ignores null keyed fields', () => {
    const data = new Buffer([0, 0x8a, 5, 0xa, 0]);

    expect(bitfieldWithPadding.unpack(data, 1)).to.deep.equal({
      a: 10,
      b: 11,
      c: 1,
    });
  });
});
