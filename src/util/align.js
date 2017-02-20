/* @flow */

import invariant from './invariant';

export default function align(value: number, alignment: number) {
  invariant(alignment > 0, 'Cannot align a value to a multiple of zero');
  return value - (value % alignment);
}
