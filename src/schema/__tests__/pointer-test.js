/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Word } from '../integer';
import PointerSchema from '../pointer';

describe('Schema: Pointers', () => {
  it('unpacks the wrapped schema at the target address', () => {
    const pointer = new PointerSchema(Word);
    const data = new Buffer([4, 3, 2, 1, 0, 0, 0, 8]);

    expect(pointer.unpack(data, 4)).to.deep.equal({
      address: 0x08000000,
      target: 0x01020304,
    });
  });

  it('has as size of 4', () => {
    const pointer = new PointerSchema(Word);
    expect(pointer.size()).to.equal(4);
  });

  it('can be nullable', () => {
    const pointer = new PointerSchema(Word, true);

    expect(pointer.unpack(new Buffer([4, 3, 2, 1, 0, 0, 0, 8]), 4)).to.deep.equal({
      address: 0x08000000,
      target: 0x01020304,
    });

    expect(pointer.unpack(new Buffer([0, 0, 0, 0]))).to.deep.equal({
      address: 0x0,
      target: null,
    });
  });

  it('must only be nullable if the specified', () => {
    const pointer = new PointerSchema(Word, false);

    expect(() => pointer.unpack(new Buffer([0, 0, 0, 0]))).to.throw('Address must be in ROM');
  });
});
