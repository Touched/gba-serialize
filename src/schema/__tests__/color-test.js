/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Color, PaletteSchema } from '../color';

describe('Schema: Color', () => {
  it('unpacks a GBA color to an RGB tuple', () => {
    expect(Color.unpack(new Buffer([0xff, 0x7f]))).to.deep.equal([255, 255, 255]);
    expect(Color.unpack(new Buffer([0, 0]))).to.deep.equal([0, 0, 0]);
    expect(Color.unpack(new Buffer([0x1f, 0]))).to.deep.equal([255, 0, 0]);
    expect(Color.unpack(new Buffer([0xe0, 3]))).to.deep.equal([0, 255, 0]);
    expect(Color.unpack(new Buffer([0, 0x7c]))).to.deep.equal([0, 0, 255]);
  });
});

describe('Schema: Palette', () => {
  it('unpacks an array of GBA colors to an array of RGBA tuples', () => {
    const data = new Buffer([
      0x1f, 0x7c,
      0xff, 0x7f,
      0, 0,
      0x1f, 0,
      0xe0, 3,
      0, 0x7c,
    ]);

    const palette = new PaletteSchema(6);

    expect(palette.unpack(data)).to.deep.equal([
      [255, 0, 255, 0],
      [255, 255, 255, 255],
      [0, 0, 0, 255],
      [255, 0, 0, 255],
      [0, 255, 0, 255],
      [0, 0, 255, 255],
    ]);
  });
});
