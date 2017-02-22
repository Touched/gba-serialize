/* @flow */

import Schema from './schema';
import invariant from '../util/invariant';
import Context from './helpers/context';
import align from '../util/align';
import createLazyObject from '../util/createLazyObject';

type StructureData = {
  [key: string]: mixed,
};

type StructureField = [string, Schema<*>];
type StructureFields = Array<StructureField>;

export default class StructureSchema extends Schema<StructureData> {
  fields: StructureFields;

  constructor(fields: StructureFields) {
    super();
    this.fields = fields;
  }

  unpack(buffer: Buffer, offset: number = 0, context: Context = new Context()): StructureData {
    let structureOffset = align(offset, this.alignment());

    return createLazyObject(this.fields.reduce((data, field) => {
      const [fieldKey, fieldSchema] = field;

      const fieldThunk = fieldSchema.unpack.bind(
        fieldSchema,
        buffer,
        structureOffset,
        new Context(context),
      );

      const fieldSize = fieldSchema.size();

      invariant(
        fieldSize > 0 && Number.isInteger(fieldSize),
        'Field size must be a non-negative positive integer',
      );

      structureOffset += fieldSize;
      structureOffset = align(structureOffset, fieldSchema.alignment());

      return {
        ...data,
        [fieldKey]: fieldThunk,
      };
    }, {}));
  }

  size(): number {
    return this.fields.reduce(
      (sum, field) => align(sum, field[1].alignment()) + field[1].size(),
      0,
    );
  }

  alignment(): number {
    return Math.max(...this.fields.map(field => field[1].alignment()));
  }
}
