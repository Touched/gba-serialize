/* @flow */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { Byte, HalfWord, Word } from '../integer';
import StructureSchema from '../structure';
import NamedValueSchema from '../namedValue';
import Schema from '../schema';
import Context from '../helpers/context';

describe('Schema: Structures', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const structure = new StructureSchema([
    ['a', Byte],
    ['b', Byte],
    ['c', HalfWord],
    ['d', Byte],
  ]);

  const structureWithPadding = new StructureSchema([
    ['a', Byte],
    [null, Byte],
    ['b', HalfWord],
    ['c', Byte],
  ]);

  it('unpacks data into sequential fields', () => {
    const data = new Buffer([4, 3, 2, 0, 1]);

    expect(structure.unpack(data)).to.deep.equal({
      a: 4,
      b: 3,
      c: 2,
      d: 1,
    });
  });

  it('ignores null keyed fields', () => {
    const data = new Buffer([4, 3, 2, 0, 1]);

    expect(structureWithPadding.unpack(data)).to.deep.equal({
      a: 4,
      b: 2,
      c: 1,
    });
  });

  it('has a size equal to the sum of the sizes', () => {
    expect(structure.size()).to.equal(5);
  });

  it('reads from the provided offset', () => {
    const data = new Buffer([0, 0, 4, 3, 2, 0, 1]);

    expect(structure.unpack(data, 2)).to.deep.equal({
      a: 4,
      b: 3,
      c: 2,
      d: 1,
    });
  });

  it('creates a lazy object when unpacking', () => {
    const unpackSpy = sandbox.spy(Byte, 'unpack');

    const structureWithSpy = new StructureSchema([
      ['a', Byte],
    ]);

    const value = structureWithSpy.unpack(new Buffer([0]));

    expect(unpackSpy).to.not.have.been.called();
    expect(value.a).to.equal(value.a);
    expect(value.a).to.equal(0);
    expect(unpackSpy).to.have.been.calledOnce();
  });

  it('eagerly unpacks named values', () => {
    const namedByte = new NamedValueSchema('namedByte', Byte);
    const context = new Context();

    const unpackSpy = sandbox.spy(namedByte, 'unpack');

    const structureWithNamedValue = new StructureSchema([
      ['a', namedByte],
    ]);

    structureWithNamedValue.unpack(new Buffer([1]), 0, context);

    expect(unpackSpy).to.have.been.called();
  });

  it('handles dynamically sized child values', () => {
    class DynamicSchema extends Schema {
      size() {
        return -1;
      }

      sizeOf({ size }) {
        return size;
      }

      unpack(buffer, offset = 0) {
        const size = offset;

        let dynamicOffset = offset;
        const data = [...Array(size)].map(() => {
          const value = Byte.unpack(buffer, dynamicOffset);
          dynamicOffset += Byte.size();
          return value;
        });

        return {
          data,
          size,
        };
      }
    }

    const structureWithDynamicSchema = new StructureSchema([
      ['a', Word],
      ['b', new DynamicSchema()],
      ['c', Word],
    ]);

    const data = new Buffer([0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0]);

    expect(structureWithDynamicSchema.unpack(data)).to.deep.equal({
      a: 0,
      b: {
        data: [1, 2, 3, 4],
        size: 4,
      },
      c: 0,
    });
  });

  describe('context', () => {
    let unpackSpy;
    let structureWithSpy;

    beforeEach(() => {
      unpackSpy = sandbox.spy(Byte, 'unpack');
      structureWithSpy = new StructureSchema([
        ['a', Byte],
      ]);
    });

    it('uses a default context', () => {
      const buffer = new Buffer([0]);
      const value = structureWithSpy.unpack(buffer);

      // Evaluate the property so that the child schema gets its unpack method called
      expect(value.a).to.equal(0);
      expect(unpackSpy).to.be.calledWith(sinon.match.any, 0, sinon.match.instanceOf(Context));
    });

    it('creates a child context with the passed in context as a parent', () => {
      const context = new Context();
      const buffer = new Buffer([0]);
      const value = structureWithSpy.unpack(buffer, 0, context);

      // Evaluate the property so that the child schema gets its unpack method called
      expect(value.a).to.equal(0);
      expect(unpackSpy).to.be.calledWith(sinon.match.any, 0, sinon.match(
        c => c.parent === context,
      ));
    });
  });
});
