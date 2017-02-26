/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { PNG } from 'pngjs2';
import fs from 'fs';
import loadFixture from '../../../test/loadFixture';
import ImageSchema from '../image';

function applyPalette(data: Buffer, palette: Array<[number, number, number, number]>): Buffer {
  return Array.from(data.values()).reduce(
    (result, pixel) => Buffer.concat([result, new Buffer(palette[pixel])]),
    new Buffer([]),
  );
}

describe('Schema: Images', () => {
  it('can unpack a 4bpp image', () => {
    const png = PNG.sync.read(fs.readFileSync(loadFixture('4bpp.png')));
    const packed = fs.readFileSync(loadFixture('4bpp-uncompressed.img.bin'));

    const image = new ImageSchema(64, 64, { bpp: 4 });
    const unpacked = image.unpack(packed);

    expect(applyPalette(unpacked, png.palette)).to.deep.equal(png.data);
  });

  it('can unpack an 8bpp image', () => {
    const png = PNG.sync.read(fs.readFileSync(loadFixture('8bpp.png')));
    const packed = fs.readFileSync(loadFixture('8bpp-uncompressed.img.bin'));

    const image = new ImageSchema(96, 96, { bpp: 8 });
    const unpacked = image.unpack(packed);

    expect(applyPalette(unpacked, png.palette)).to.deep.equal(png.data);
  });
});
