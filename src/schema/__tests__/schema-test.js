/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { Schema, Value } from '../schema';

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
