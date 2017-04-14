/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import Charmap from '../charmap';
import encode from '../encode';

const charmap = new Charmap({
  character: new Map([
    ['H', new Buffer([12, 43])],
    ['e', new Buffer([17])],
    ['l', new Buffer([0])],
    ['o', new Buffer([127])],
  ]),
  placeholder: new Map([
    ['x', new Buffer([129])],
  ]),
  escape: new Map([
    ['j', new Buffer([128])],
  ]),
  terminator: new Map([
    ['$', new Buffer([255])],
  ]),
});

describe('String Encoder', () => {
  it('creates a buffer using a character map', () => {
    const expected = new Buffer([12, 43, 17, 0, 0, 127, 255]);

    expect(encode('Hello', charmap)).to.deep.equal(expected);
  });

  it('encodes all character types', () => {
    expect(encode('o\\j[x]', charmap)).to.deep.equal(new Buffer([127, 128, 129, 255]));
  });

  it('encodes hex escapes', () => {
    expect(encode('\\xff', charmap)).to.deep.equal(new Buffer([255, 255]));
  });

  it('encodes placeholder arguments as a byte sequence', () => {
    expect(encode('[x 1 2 3]', charmap)).to.deep.equal(new Buffer([129, 1, 2, 3, 255]));
  });

  it('encodes additional placeholder arguments as placeholders', () => {
    expect(encode('[x 1 x 2]', charmap)).to.deep.equal(new Buffer([129, 1, 129, 2, 255]));
  });
});
