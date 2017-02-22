/* @flow */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { Byte, HalfWord } from '../integer';
import StructureSchema from '../structure';
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
