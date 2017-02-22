/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { spy } from 'sinon';
import { Byte, HalfWord } from '../integer';
import StructureSchema from '../structure';

describe('Schema: Structures', () => {
  const structure = new StructureSchema([
    ['a', Byte],
    ['b', Byte],
    ['c', HalfWord],
    ['d', Byte],
  ]);

  const structureWithAlignment = new StructureSchema([
    ['a', Byte],
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

  it('has a size equal to the sum of the sizes', () => {
    expect(structure.size()).to.equal(5);
  });

  it('factors alignment into size calculation', () => {
    expect(structureWithAlignment.size()).to.equal(5);
  });

  it('determines the alignment from the biggest element', () => {
    expect(structure.alignment()).to.equal(2);
  });

  it('aligns the provided offset', () => {
    const data = new Buffer([0, 0, 4, 3, 2, 0, 1]);

    expect(structure.unpack(data, 1)).to.deep.equal({
      a: 4,
      b: 3,
      c: 2,
      d: 1,
    });
  });

  it('reads aligned values correctly', () => {
    const data = new Buffer([1, 0, 2, 0, 3]);

    expect(structureWithAlignment.unpack(data)).to.deep.equal({
      a: 1,
      b: 2,
      c: 3,
    });
  });

  it('creates a lazy object when unpacking', () => {
    const unpackSpy = spy(Byte, 'unpack');

    const structureWithSpy = new StructureSchema([
      ['a', Byte],
    ]);

    const value = structureWithSpy.unpack(new Buffer([0]));

    expect(unpackSpy).to.not.have.been.called();
    expect(value.a).to.equal(value.a);
    expect(value.a).to.equal(0);
    expect(unpackSpy).to.have.been.calledOnce();
  });
});
