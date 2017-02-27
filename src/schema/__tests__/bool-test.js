/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Boolean } from '../bool';

describe('Schema: Booleans', () => {
  it('converts any non-zero value to true', () => {
    expect(Boolean.unpack(new Buffer([1]))).to.equal(true);
    expect(Boolean.unpack(new Buffer([2]))).to.equal(true);
  });

  it('converts zeroes to false', () => {
    expect(Boolean.unpack(new Buffer([0]))).to.equal(false);
  });

  it('delegates to the backing schema for the size of the field', () => {
    expect(Boolean.size()).to.equal(1);
  });
});
