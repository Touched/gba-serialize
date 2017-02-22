/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import EnumSchema from '../enum';
import { Word } from '../integer';

describe('Schema: Enums', () => {
  const enumWord = new EnumSchema(new Map([
    [0, 'a'],
    [1, 'b'],
    [2, 'c'],
  ]), Word);

  it('converts an unpacked integer to a string', () => {
    expect(enumWord.unpack(new Buffer([0, 0, 0, 0]))).to.equal('a');
    expect(enumWord.unpack(new Buffer([1, 0, 0, 0]))).to.equal('b');
    expect(enumWord.unpack(new Buffer([2, 0, 0, 0]))).to.equal('c');
  });

  it('converts invalid values to null', () => {
    expect(enumWord.unpack(new Buffer([3, 0, 0, 0]))).to.be.null();
  });
});
