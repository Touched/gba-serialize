/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Byte, HalfWord } from '../integer';
import { StructureSchema } from '../structure';

describe('Schema: Structures', () => {
  describe('Static sized', () => {
    const structure = new StructureSchema([
      ['a', Byte],
      ['b', Byte],
      ['c', HalfWord],
      ['d', Byte],
    ]);

    it('unpacks data into sequential fields', () => {
      const data = new Buffer([4, 3, 2, 0, 1]);
      const { a, b, c, d } = structure.unpack(data).value();

      expect(a.value()).to.equal(4);
      expect(b.value()).to.equal(3);
      expect(c.value()).to.equal(2);
      expect(d.value()).to.equal(1);
    });

    it('has a static size', () => {
      const data = new Buffer([0, 0, 0, 0]);
      expect(structure.size()).to.equal(5);
      expect(structure.unpack(data).size()).to.equal(5);
    });

    it('determines the alignment from the biggest element', () => {
      expect(structure.alignment()).to.equal(2);
    });

    it('aligns the provided offset', () => {
      const data = new Buffer([0, 0, 4, 3, 2, 0, 1]);
      const { a, b, c, d } = structure.unpack(data, 3).value();

      expect(a.value()).to.equal(4);
      expect(b.value()).to.equal(3);
      expect(c.value()).to.equal(2);
      expect(d.value()).to.equal(1);      
    });
  });
});
