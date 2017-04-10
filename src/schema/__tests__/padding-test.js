/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import PaddingSchema from '../padding';

describe('Schema: Padding', () => {
  it('has whatever size you pass in', () => {
    expect(new PaddingSchema(3).size()).to.equal(3);
    expect(new PaddingSchema(10).size()).to.equal(10);
  });

  it('always unpacks to null', () => {
    expect(new PaddingSchema(4).unpack(new Buffer([]))).to.be.null();
  });
});
