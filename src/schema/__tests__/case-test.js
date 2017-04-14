/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import CaseSchema, { test } from '../case';
import ArraySchema from '../array';
import { HalfWord, Word } from '../integer';
import Context from '../helpers/context';

describe('Schema: Case', () => {
  const schema = new CaseSchema([{
    name: 'test',
    condition: {
      lt: 0,
    },
    schema: new ArraySchema(Word, 'length'),
  }, {
    name: 'test',
    condition: {
      eq: 1,
    },
    schema: HalfWord,
  }, {
    name: 'test',
    condition: {
      ge: 1,
    },
    schema: Word,
  }]);

  it('picks the first schema with a true condition', () => {
    const buffer = new Buffer([1, 2, 3, 4]);
    const context = new Context();

    context.set('test', 1);
    expect(schema.unpack(buffer, 0, context)).to.deep.equal({ case: 1, value: 0x0201 });

    context.set('test', 2);
    expect(schema.unpack(buffer, 0, context)).to.deep.equal({ case: 2, value: 0x04030201 });
  });

  it('throws an error if nothing matches', () => {
    const buffer = new Buffer([1, 2, 3, 4]);
    const context = new Context();

    context.set('test', 0);
    expect(() => schema.unpack(buffer, 0, context)).to.throw('Failed to match any case');
  });

  it('reports the correct size', () => {
    expect(schema.sizeOf({ case: 0, value: [0, 1, 2, 3] })).to.equal(16);
    expect(schema.sizeOf({ case: 1, value: 0 })).to.equal(2);
    expect(schema.sizeOf({ case: 2, value: 0 })).to.equal(4);
  });

  describe('Conditions', () => {
    it('less than', () => {
      expect(test({ lt: 1 }, 0)).to.be.true();
      expect(test({ lt: 1 }, 10)).to.be.false();
      expect(test({ lt: 1 }, 1)).to.be.false();
    });

    it('less than equal', () => {
      expect(test({ le: 1 }, 0)).to.be.true();
      expect(test({ le: 1 }, 1)).to.be.true();
      expect(test({ le: 1 }, 10)).to.be.false();
    });

    it('equal to', () => {
      expect(test({ eq: 1 }, 1)).to.be.true();
      expect(test({ eq: '1' }, '1')).to.be.true();
      expect(test({ eq: 1 }, 10)).to.be.false();
      expect(test({ eq: '1' }, 1)).to.be.false();
    });

    it('greater than equal', () => {
      expect(test({ ge: 0 }, 1)).to.be.true();
      expect(test({ ge: 1 }, 1)).to.be.true();
      expect(test({ ge: 10 }, 1)).to.be.false();
    });

    it('greater than', () => {
      expect(test({ gt: 0 }, 1)).to.be.true();
      expect(test({ gt: 10 }, 1)).to.be.false();
      expect(test({ gt: 1 }, 1)).to.be.false();
    });

    it('logical AND', () => {
      const cond = {
        all: [{ gt: 1 }, { lt: 10 }],
      };

      expect(test(cond, 5)).to.be.true();
      expect(test(cond, 6)).to.be.true();
      expect(test(cond, 0)).to.be.false();
      expect(test(cond, 11)).to.be.false();
    });

    it('logical OR', () => {
      const cond = {
        any: [{ lt: 1 }, { gt: 10 }],
      };

      expect(test(cond, 0)).to.be.true();
      expect(test(cond, 11)).to.be.true();
      expect(test(cond, 5)).to.be.false();
      expect(test(cond, 6)).to.be.false();
    });

    it('default', () => {
      expect(test({}, 0)).to.be.true();
      expect(test({}, 1)).to.be.true();
      expect(test({}, -1)).to.be.true();
      expect(test({}, '1')).to.be.true();
    });
  });
});
