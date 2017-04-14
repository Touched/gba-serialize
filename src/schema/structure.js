/* @flow */

import Schema from './schema';
import invariant from '../util/invariant';
import Context from './helpers/context';
import createLazyObject from '../util/createLazyObject';
import NamedValueSchema from './namedValue';

type StructureData = {
  [key: string]: mixed,
};

type StructureField = [?string, Schema<*>];
type StructureFields = Array<StructureField>;

export default class StructureSchema extends Schema<StructureData> {
  fields: StructureFields;

  constructor(fields: StructureFields) {
    super();
    this.fields = fields;
  }

  unpack(buffer: Buffer, offset: number = 0, context: Context = new Context()): StructureData {
    let structureOffset = offset;

    const structureContext = new Context(context);

    return createLazyObject(this.fields.reduce((data, field) => {
      const [fieldKey, fieldSchema] = field;

      const fieldSize = fieldSchema.size();
      let fieldThunk;

      /* Dynamic values cannot be lazily unpacked, and named values
         must be eagerly evaluated so that they appear in the
         context. */
      if (fieldSize === -1 || fieldSchema instanceof NamedValueSchema) {
        const value = fieldSchema.unpack(buffer, structureOffset, structureContext);

        structureOffset += fieldSchema.sizeOf(value);

        fieldThunk = () => value;
      } else {
        fieldThunk = fieldSchema.unpack.bind(
          fieldSchema,
          buffer,
          structureOffset,
          structureContext,
        );

        invariant(
          fieldSize > 0 && Number.isInteger(fieldSize),
          'Field size must be a non-negative positive integer',
        );

        structureOffset += fieldSize;
      }

      if (!fieldKey) {
        if (fieldSize === -1) {
          throw new Error('Dynamically sized values must be named in the structure');
        }

        return data;
      }

      return {
        ...data,
        [fieldKey]: fieldThunk,
      };
    }, {}));
  }

  size(): number {
    if (this.fields.some(field => field[1].size() === -1)) {
      return -1;
    }

    return this.fields.reduce(
      (sum, field) => sum + field[1].size(),
      0,
    );
  }

  sizeOf(value: StructureData): number {
    if (this.fields.some(field => field[1].size() === -1)) {
      return this.fields.reduce((sum, [fieldName, fieldSchema]) => {
        const size = fieldSchema.size();

        if (size === -1) {
          invariant(fieldName, 'Dynamically sized schemas as structure fields must be named');
          return sum + fieldSchema.sizeOf((value[fieldName]: any));
        }

        return sum + size;
      }, 0);
    }

    return this.size();
  }
}
