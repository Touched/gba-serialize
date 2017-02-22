/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import Context from '../context';

describe('Schema Helpers: Context', () => {
  describe('#push', () => {
    it('does not affect the parent context', () => {
      const parent = new Context();
      const child = new Context(parent);

      child.set('key', 'value');

      expect(Array.from(child.values)).to.deep.equal([['key', 'value']]);
      expect(Array.from(parent.values)).to.deep.equal([]);
    });
  });

  describe('#get', () => {
    it('looks up a value in the context', () => {
      const context = new Context();
      context.set('a', 1);

      expect(context.get('a')).to.equal(1);
    });

    it('can look up values in a parent context from the child', () => {
      const parent = new Context();
      const child = new Context(parent);

      parent.set('a', 1);

      expect(child.get('a')).to.equal(1);
    });

    it('lets child values override values in the parent mapping', () => {
      const parent = new Context();
      const child = new Context(parent);

      parent.set('a', 1);
      child.set('a', 10);

      expect(child.get('a')).to.equal(10);
      expect(parent.get('a')).to.equal(1);
    });

    it('throws an expection if the key does not exist', () => {
      const context = new Context();

      expect(() => {
        context.get('a');
      }).to.throw('Undefined key');
    });
  });

  describe('#has', () => {
    it('returns true if the key exists in the child or its parent scopes', () => {
      const grandparent = new Context();
      const parent = new Context(grandparent);
      const child = new Context(parent);

      grandparent.set('a', 1);

      expect(child.has('a')).to.be.true();
    });

    it('returns false if the key does not exist', () => {
      const context = new Context();
      expect(context.has('a')).to.be.false();
    });
  });
});
