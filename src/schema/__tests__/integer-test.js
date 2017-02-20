/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Word, HalfWord, SignedWord, IntegerValue } from '../integer';

describe('Schema: Integers', () => {
  it('unpacks little-endian words', () => {
    const data = new Buffer([4, 3, 2, 1]);

    expect(Word.unpack(data).value()).to.equal(0x01020304);
    expect(HalfWord.unpack(data).value()).to.equal(0x0304);
  });

  it('unpacks relative to the offset', () => {
    const data = new Buffer([0, 0, 0, 0, 4, 3, 2, 1]);

    expect(Word.unpack(data, 4).value()).to.equal(0x01020304);
    expect(HalfWord.unpack(data, 4).value()).to.equal(0x0304);
  });

  it('unpacks signed values', () => {
    const data = new Buffer([255, 255, 255, 255]);
    expect(SignedWord.unpack(data).value()).to.equal(-1);
  });

  it('enforces alignment', () => {
    const data = new Buffer([0, 0, 0, 0, 5, 4, 3, 2, 1]);
    expect(Word.unpack(data, 7).value()).to.equal(0x02030405);
    expect(HalfWord.unpack(data, 7).value()).to.equal(0x0203);
  });

  it('unpacks a value with a valid size', () => {
    const data = new Buffer([0, 0, 0, 0]);
    expect(Word.unpack(data).size()).to.equal(4);
    expect(HalfWord.unpack(data).size()).to.equal(2);
  });

  it('is not a dynamic type', () => {
    expect(Word.size()).to.equal(4);
    expect(HalfWord.size()).to.equal(2);
  });

  it('sets the alignment to be equal to the size', () => {
    expect(Word.alignment()).to.equal(4);
    expect(HalfWord.alignment()).to.equal(2);
  });
});
