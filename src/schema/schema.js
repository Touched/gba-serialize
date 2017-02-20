/* @flow */

import invariant from '../util/invariant';

export class Value {
  schema: $Subtype<Schema>;
  data: any;

  constructor(schema: Schema, data: any) {
    this.schema = schema;
    this.data = data;
  }

  size(): number {
    return 0;
  }
}

export class Schema {
  unpack(buffer: Buffer, offset: number = 0): $Subtype<Value> {
    invariant(Buffer.isBuffer(buffer), 'Must pass in a buffer object.');
    invariant(offset >= 0 && Number.isInteger(offset), '`offset` must be a non-negative integer.');
  }

  alignment(): number {
    return 0;
  }
}
