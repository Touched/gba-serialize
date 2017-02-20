/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Schema, Value } from '../schema';
import sinon from 'sinon';

describe('Schema: Values', () => {
  it('lazily computes the value', () => {
    const spy = sinon.spy();
    const schema = new Schema();
    const value = new Value(schema, spy);

    value.value();
    value.value();

    expect(spy).to.have.been.calledOnce();
  });
});
