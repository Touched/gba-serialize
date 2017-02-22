/* @flow */

export default function createLazyObject(object: { [string]: () => mixed }): { [string]: mixed } {
  const properties = Object.keys(object).reduce((acc, key) => ({
    ...acc,
    [key]: {
      enumerable: true,
      configurable: true,
      get() {
        const value = object[key].call(this);
        Object.defineProperty(this, key, {
          enumerable: true,
          writable: true,
          value,
        });
        return value;
      },
    },
  }), {});

  return Object.defineProperties({}, properties);
}
