/* @flow */

import Schema from './schema';
import invariant from '../util/invariant';
import align from '../util/align';

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

  unpack(buffer: Buffer, offset: number = 0): StructureData {
    let structureOffset = align(offset, this.alignment());

    return this.fields.reduce((data, field) => {
      const [fieldKey, fieldSchema] = field;
      const fieldValue = fieldSchema.unpack(buffer, structureOffset);
      const fieldSize = fieldSchema.size();

      invariant(
        fieldSize > 0 && Number.isInteger(fieldSize),
        'Field size must be a non-negative positive integer',
      );

      structureOffset += fieldSize;

      return {
        ...data,
        [fieldKey]: fieldValue,
      };
    }, {});
  }

  size(): number {
    return this.fields.reduce((sum, field) => sum + field[1].size(), 0);
  }

  alignment(): number {
    return Math.max(...this.fields.map(field => field[1].alignment()));
  }
}
