/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import ListSchema from '../list';
import { Byte } from '../integer';

describe('Schema: List', () => {
  it('unpacks the value repeatedly until the sentinel is reached', () => {
    const list = new ListSchema(Byte, 0);
    const buffer = new Buffer([1, 2, 3, 4, 5, 0]);

    expect(list.unpack(buffer)).to.deep.equal([1, 2, 3, 4, 5]);
    expect(list.unpack(buffer, 1)).to.deep.equal([2, 3, 4, 5]);
    expect(list.unpack(buffer, 2)).to.deep.equal([3, 4, 5]);
  });

  it('has the correct size', () => {
    const list = new ListSchema(Byte, 0);
    expect(list.size()).to.equal(-1);
    expect(list.sizeOf([1, 2, 3, 4, 5])).to.equal(6);
  });

  it('returns the correct size for variable elements', () => {
    const list = new ListSchema(new ListSchema(Byte, 0), []);
    expect(list.sizeOf([[1, 2], [2, 3], [4, 5]])).to.equal(10);
  });

  it('unpacks variable sized elements', () => {
    const list = new ListSchema(new ListSchema(Byte, 0), []);

    const buffer = new Buffer([1, 2, 0, 3, 4, 0, 0]);

    expect(list.unpack(buffer)).to.deep.equal([[1, 2], [3, 4]]);
  });
});
