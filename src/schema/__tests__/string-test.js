/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import Context from '../helpers/context';
import StringSchema from '../string';
import Charmap from '../../string/charmap';

describe('Schema: Strings', () => {
  describe('Node.js encodings', () => {
    it('can unpack a terminated string', () => {
      const string = new StringSchema();
      const buffer = new Buffer('123Hello World!\0', 'ascii');

      const value = {
        encoding: 'ascii',
        terminated: true,
        value: 'Hello World!',
        size: 13,
      };

      expect(string.unpack(buffer, 3)).to.deep.equal(value);
      expect(string.size()).to.equal(-1);
      expect(string.sizeOf(value)).to.equal(13);
    });

    it('can unpack a terminated string without a terminator', () => {
      const string = new StringSchema();
      const buffer = new Buffer('123Hello World!', 'ascii');

      const value = {
        encoding: 'ascii',
        terminated: true,
        value: 'Hello World!',
        size: 12,
      };

      expect(string.unpack(buffer, 3)).to.deep.equal(value);
      expect(string.size()).to.equal(-1);
      expect(string.sizeOf(value)).to.equal(12);
    });

    it('can unpack a fixed length string', () => {
      const string = new StringSchema('ascii', 6);
      const buffer = new Buffer('123456', 'ascii');

      const value = {
        encoding: 'ascii',
        terminated: false,
        value: '123456',
        size: 6,
      };

      expect(string.unpack(buffer)).to.deep.equal(value);
      expect(string.size()).to.equal(6);
    });

    it('can unpack a fixed length string from a context specified length', () => {
      const context = new Context();
      context.set('length', 6);

      const string = new StringSchema('ascii', 'length');
      const buffer = new Buffer('123456', 'ascii');

      const value = {
        encoding: 'ascii',
        terminated: false,
        value: '123456',
        size: 6,
      };

      expect(string.unpack(buffer, 0, context)).to.deep.equal(value);
      expect(string.size()).to.equal(-1);
      expect(string.sizeOf(value)).to.equal(6);
    });
  });

  describe('Custom encodings', () => {
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

    it('can unpack a terminated string', () => {
      const string = new StringSchema(charmap);
      const buffer = new Buffer([0, 12, 43, 12, 0, 0, 12, 47, 0xFF, 12]);

      const value = {
        encoding: charmap,
        terminated: true,
        value: 'Hello',
        size: 8,
      };

      expect(string.unpack(buffer, 1)).to.deep.equal(value);
      expect(string.size()).to.equal(-1);
      expect(string.sizeOf(value)).to.equal(8);
    });

    it('can unpack a terminated string without a terminator', () => {
      const string = new StringSchema(charmap);
      const buffer = new Buffer([0, 12, 43, 12, 0, 0, 12, 47]);

      const value = {
        encoding: charmap,
        terminated: true,
        value: 'Hello',
        size: 7,
      };

      expect(string.unpack(buffer, 1)).to.deep.equal(value);
      expect(string.size()).to.equal(-1);
      expect(string.sizeOf(value)).to.equal(7);
    });

    it('can unpack a fixed length string', () => {
      const string = new StringSchema(charmap, 5);
      const buffer = new Buffer([0, 12, 43, 12, 0, 0, 12, 47]);

      const value = {
        encoding: charmap,
        terminated: false,
        value: 'Hell',
        size: 5,
      };

      expect(string.unpack(buffer, 1)).to.deep.equal(value);
      expect(string.size()).to.equal(5);
    });

    it('can unpack a fixed length string from a context specified length', () => {
      const context = new Context();
      context.set('length', 5);

      const string = new StringSchema(charmap, 'length');
      const buffer = new Buffer([0, 12, 43, 12, 0, 0, 12, 47]);

      const value = {
        encoding: charmap,
        terminated: false,
        value: 'Hell',
        size: 5,
      };

      expect(string.unpack(buffer, 1, context)).to.deep.equal(value);
      expect(string.size()).to.equal(-1);
      expect(string.sizeOf(value)).to.equal(5);
    });
  });
});
