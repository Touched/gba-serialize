/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Byte, HalfWord } from '../integer';
import StructureSchema from '../structure';

describe('Schema: Structures', () => {
  const structure = new StructureSchema([
    ['a', Byte],
    ['b', Byte],
    ['c', HalfWord],
    ['d', Byte],
  ]);

  it('unpacks data into sequential fields', () => {
    const data = new Buffer([4, 3, 2, 0, 1]);

    expect(structure.unpack(data)).to.deep.equal({
      a: 4,
      b: 3,
      c: 2,
      d: 1,
    });
  });

  it('has a size equal to the sum of the sizes', () => {
    expect(structure.size()).to.equal(5);
  });

  it('determines the alignment from the biggest element', () => {
    expect(structure.alignment()).to.equal(2);
  });

  it('aligns the provided offset', () => {
    const data = new Buffer([0, 0, 4, 3, 2, 0, 1]);

    expect(structure.unpack(data, 3)).to.deep.equal({
      a: 4,
      b: 3,
      c: 2,
      d: 1,
    });
  });
});
