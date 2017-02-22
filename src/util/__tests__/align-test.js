/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import align from '../align';

describe('Util: align', () => {
  it('does not alter already aligned values', () => {
    expect(align(0, 4)).to.equal(0);
    expect(align(4, 4)).to.equal(4);
    expect(align(4, 2)).to.equal(4);
  });

  it('aligns to the next multiple of the alignment value', () => {
    expect(align(3, 4)).to.equal(4);
    expect(align(3, 2)).to.equal(4);
    expect(align(7, 4)).to.equal(8);
  });
});
