/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import ArraySchema from '../array';
import { HalfWord, Word } from '../integer';
import Context from '../helpers/context';

describe('Schema: Arrays', () => {
  it('repeatedly unpacks a value a context-provided number of times', () => {
    const array = new ArraySchema(HalfWord, 'count');
    const context = new Context();
    context.set('count', 5);

    const buffer = new Buffer([0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0]);
    const value = array.unpack(buffer, 1, context);

    expect(value).to.deep.equal([1, 2, 3, 4, 5]);
  });

  it('derives alignment from the input schema', () => {
    const array = new ArraySchema(Word, 'count');
    expect(array.alignment()).to.equal(4);
  });

  it('does not have a fixed size', () => {
    const array = new ArraySchema(Word, 'count');
    expect(array.size()).to.equal(-1);
  });

  it('can tell the size of a value it unpack', () => {
    const array = new ArraySchema(Word, 'count');
    expect(array.sizeOf([0, 0, 0])).to.equal(12);

    const nestedArray = new ArraySchema(new ArraySchema(Word, 'count'), 'count');
    expect(nestedArray.sizeOf([[0, 0, 0], [0, 0, 0], [0, 0, 0]])).to.equal(36);
  });
});
