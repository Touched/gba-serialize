/* @flow */

/* eslint-disable no-bitwise */

import Schema from './schema';
import { HalfWord } from './integer';

type RGB = [number, number, number];
type RGBA = [number, number, number, number];

const MULTIPLIER = 255 / 31;

export default class ColorSchema extends Schema<RGB> {
  unpack(buffer: Buffer, offset: number = 0): RGB {
    const value = HalfWord.unpack(buffer, offset);

    const r = Math.floor((value & 0x1f) * MULTIPLIER);
    const g = Math.floor(((value >> 5) & 0x1f) * MULTIPLIER);
    const b = Math.floor(((value >> 10) & 0x1f) * MULTIPLIER);

    return [r, g, b];
  }

  size(): number {
    return 2;
  }
}

export const Color = new ColorSchema();

export class PaletteSchema extends Schema<Array<RGBA>> {
  colors: number;

  constructor(colors: number) {
    super();
    this.colors = colors;
  }

  unpack(buffer: Buffer, offset: number = 0): Array<RGBA> {
    let paletteOffset = offset;

    return [...Array(this.colors)].map((_, index) => {
      const a = index ? 255 : 0;
      const [r, g, b] = Color.unpack(buffer, paletteOffset);

      paletteOffset += Color.size();

      return [r, g, b, a];
    });
  }

  size(): number {
    return this.colors * Color.size();
  }
}
