/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import Charmap from '../charmap';

describe('String Charmap', () => {
  describe('parse', () => {
    it('loads a charmap', () => {
      const source = `
         ' '         = 00
         'À'         = 01
         '\\''       = 02

         'あ' = 01 @ a comment
         'い' = 02

         '\\$' = 04
         '$' = FF

         @ another comment
         STRING = FD

         KEY_A          = F8 00
         KEY_B          = F8 01

         '\\l' = FA
         '\\p' = FB
         '\\n' = FE`;

      const character = new Map([
        [' ', new Buffer([0])],
        ['À', new Buffer([1])],
        ['\'', new Buffer([2])],
        ['あ', new Buffer([1])],
        ['い', new Buffer([2])],
        ['$', new Buffer([4])],
      ]);

      const placeholder = new Map([
        ['STRING', new Buffer([0xFD])],
        ['KEY_A', new Buffer([0xF8, 0])],
        ['KEY_B', new Buffer([0xF8, 1])],
      ]);

      const escape = new Map([
        ['l', new Buffer([0xFA])],
        ['p', new Buffer([0xFB])],
        ['n', new Buffer([0xFE])],
      ]);

      const terminator = new Map([
        ['$', new Buffer([255])],
      ]);

      const charmap = Charmap.parse(source);

      function array(map) {
        return Array.from(map.entries());
      }

      expect(array(charmap.map.character)).to.deep.equal(array(character));
      expect(array(charmap.map.placeholder)).to.deep.equal(array(placeholder));
      expect(array(charmap.map.escape)).to.deep.equal(array(escape));
      expect(array(charmap.map.terminator)).to.deep.equal(array(terminator));
    });
  });
});
