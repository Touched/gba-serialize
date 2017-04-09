/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import TupleSchema from '../tuple';
import { Byte, HalfWord, Word } from '../integer';

describe('Schema: Tuples', () => {
  it('unpacks the values in sequence', () => {
    const array = new TupleSchema([HalfWord, Byte, Word]);

    const buffer = new Buffer([1, 0, 2, 3, 0, 0, 0]);
    const value = array.unpack(buffer, 0);

    expect(value).to.deep.equal([1, 2, 3]);
  });
});
