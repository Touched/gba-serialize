/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import align from '../align';

describe('Util: align', () => {
  it('does not alter already aligned values', () => {
    expect(align(4, 4)).to.equal(4);
  });

  it('aligns to the biggest multiple of alignment that is less than the input', () => {
    expect(align(3, 4)).to.equal(0);
    expect(align(3, 2)).to.equal(2);
    expect(align(7, 4)).to.equal(4);
  });
});
