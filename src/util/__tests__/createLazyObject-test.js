/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { spy } from 'sinon';
import createLazyObject from '../createLazyObject';

describe('Util: createLazyObject', () => {
  it('creates an object with the same keys', () => {
    const object = { a: () => 1, b: () => 2, c: () => 3 };

    expect(createLazyObject(object)).to.have.keys(Object.keys(object));
  });

  it('creates an object with the same values', () => {
    const object = { a: () => 1, b: () => 2, c: () => 3 };

    expect(Object.values(createLazyObject(object))).to.deep.equal([1, 2, 3]);
  });

  it('caches the thunk result after calling it', () => {
    const object = { a: spy() };
    const lazyObject = createLazyObject(object);

    // Access the property twice
    expect(lazyObject.a).to.deep.equal(lazyObject.a);
    expect(object.a).to.have.been.calledOnce();
  });

  it('only calls the thunk if the property was accessed', () => {
    const object = { a: spy(() => 1), b: spy(() => 2) };
    const lazyObject = createLazyObject(object);

    expect(lazyObject.a).to.equal(1);
    expect(object.a).to.have.been.called();
    expect(object.b).to.not.have.been.called();
  });

  it('thunks work if they use this', () => {
    const object = {
      a() {
        return this.b;
      },
      b: () => 2,
    };

    const lazyObject = createLazyObject(object);

    expect(lazyObject.a).to.equal(2);
  });
});
