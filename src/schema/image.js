/* @flow */

/* eslint-disable no-bitwise */

import Schema from './schema';
import invariant from '../util/invariant';

type Point = { x: number, y: number };
type Dimensions = { width: number, height: number };

function getPixel(image: Buffer, offset: number, bpp: number) {
  const pixelsPerByte = Math.floor(8 / bpp);
  const byteOffset = Math.floor(offset / pixelsPerByte);

  const mask = (1 << bpp) - 1;
  const shift = bpp * (offset % pixelsPerByte);

  return (image[byteOffset] >> shift) & mask;
}

function tiledCodec(
  { x, y }: Point, { width, height }: Dimensions,
  image: Buffer,
  bpp: number,
): number {
  const tileX = Math.floor(x / 8);
  const tileY = Math.floor(y / 8);
  const widthInTiles = Math.floor(width / 8);
  const tileIndex = tileX + (tileY * widthInTiles);

  const tilePixelX = x % 8;
  const tilePixelY = y % 8;
  const tileOffset = tilePixelX + (tilePixelY * 8);

  return getPixel(image, (tileIndex * 64) + tileOffset, bpp);
}

function indexToPoint(index: number, { width, height }: Dimensions): Point {
  const x = index % width;
  const y = Math.floor(index / width);

  invariant(y < height, 'Index out of range');

  return { x, y };
}

type ImageSchemaOptions = { bpp: number };

export default class ImageSchema extends Schema<Buffer> {
  dimensions: Dimensions;
  bpp: number;

  constructor(width: number, height: number, options: ImageSchemaOptions) {
    super();
    this.dimensions = { width, height };
    this.bpp = options.bpp;
  }

  unpack(buffer: Buffer, offset: number = 0): Buffer {
    const { width, height } = this.dimensions;
    const pixelCount = width * height;

    const pixels = [...Array(pixelCount)].map((_, index) => tiledCodec(
      indexToPoint(index, this.dimensions),
      this.dimensions,
      buffer,
      this.bpp,
    ));

    return new Buffer(pixels);
  }

  size(): number {
    return -1;
  }

  sizeOf(value: Buffer): number {
    return -1;
  }
}
