/* @flow */

export default class Context {
  parent: ?Context;
  values: Map<string, mixed>;

  constructor(parentContext?: Context) {
    this.parent = parentContext || null;
    this.values = new Map();
  }

  set(key: string, value: mixed) {
    this.values.set(key, value);
  }

  get(key: string): mixed {
    let context = this;

    while (context) {
      if (context.values.has(key)) {
        return context.values.get(key);
      }

      context = context.parent;
    }

    throw new Error('Undefined key');
  }

  has(key: string): bool {
    let context = this;

    while (context) {
      if (context.values.has(key)) {
        return true;
      }

      context = context.parent;
    }

    return false;
  }
}
