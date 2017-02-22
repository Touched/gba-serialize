/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Word, HalfWord, SignedWord } from '../integer';

describe('Schema: Integers', () => {
  it('unpacks little-endian words', () => {
    const data = new Buffer([4, 3, 2, 1]);

    expect(Word.unpack(data)).to.equal(0x01020304);
    expect(HalfWord.unpack(data)).to.equal(0x0304);
  });

  it('unpacks relative to the offset', () => {
    const data = new Buffer([0, 0, 0, 0, 4, 3, 2, 1]);

    expect(Word.unpack(data, 4)).to.equal(0x01020304);
    expect(HalfWord.unpack(data, 4)).to.equal(0x0304);
  });

  it('unpacks signed values', () => {
    const data = new Buffer([255, 255, 255, 255]);
    expect(SignedWord.unpack(data)).to.equal(-1);
  });

  it('has a size equal to the size specified', () => {
    expect(Word.size()).to.equal(4);
    expect(HalfWord.size()).to.equal(2);
  });
});
