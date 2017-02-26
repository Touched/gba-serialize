/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Byte } from '../integer';
import NamedValueSchema from '../namedValue';
import Context from '../helpers/context';

describe('Schema: NamedValue', () => {
  it('delegates to the child schema and adds the value to the context', () => {
    const namedByte = new NamedValueSchema('namedByte', Byte);
    const context = new Context();
    const value = namedByte.unpack(new Buffer([1]), 0, context);

    expect(value).to.equal(1);
    expect(context.get('namedByte')).to.equal(1);
  });

  it('delegates size and sizeOf to child schema', () => {
    const namedByte = new NamedValueSchema('namedByte', Byte);

    expect(namedByte.size()).to.equal(Byte.size());
    expect(namedByte.sizeOf(1)).to.equal(Byte.sizeOf(1));
  });
});
