/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import Charmap from '../charmap';
import buildDecoder from '../decode';

const charmap = new Charmap({
  character: new Map([
    ['H', new Buffer([12, 43])],
    ['e', new Buffer([12])],
    ['l', new Buffer([0])],
    ['o', new Buffer([12, 47])],
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

const decode = buildDecoder(charmap);

describe('String Decoder', () => {
  it('should decode the string', () => {
    const buffer = new Buffer([12, 43, 12, 0, 0, 12, 47, 0xFF, 12]);
    expect(decode(buffer)).to.deep.equal([8, 'Hello']);
  });

  it('decodes all character types', () => {
    expect(decode(new Buffer([128, 129, 12]))).to.deep.equal([3, '\\j[x]e']);
  });

  it('decodes unknown characters to hex escapes', () => {
    expect(decode(new Buffer([3, 4, 5]))).to.deep.equal([3, '\\x03\\x04\\x05']);
  });
});
