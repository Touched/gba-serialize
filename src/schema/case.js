/* @flow */

import Schema from './schema';
import Context from './helpers/context';
import invariant from '../util/invariant';

type LessThanCondition = {|
  lt: number,
|};

type LessThanEqualCondition = {|
  le: number,
|};

type EqualCondition = {|
  eq: mixed,
|};

type GreaterThanEqualCondition = {|
  ge: number,
|};

type GreaterThanCondition = {|
  gt: number,
|};

type AllCondition = {|
  all: Array<Condition>,
|};

type AnyCondition = {|
  any: Array<Condition>,
|};

type DefaultCondition = {||};

type Condition = LessThanCondition
               | LessThanEqualCondition
               | EqualCondition
               | GreaterThanEqualCondition
               | GreaterThanCondition
               | AllCondition
               | AnyCondition
               | DefaultCondition;

type Case = {
  name: string,
  condition: Condition,
  schema: Schema<any>,
};

type CaseValue = {
  case: number,
  value: mixed,
};

export function test(condition: Condition, value: mixed) {
  if (condition.lt !== undefined) {
    invariant(typeof value === 'number', 'Value must be a number');
    return value < condition.lt;
  } else if (condition.le !== undefined) {
    invariant(typeof value === 'number', 'Value must be a number');
    return value <= condition.le;
  } else if (condition.eq !== undefined) {
    return value === condition.eq;
  } else if (condition.ge !== undefined) {
    invariant(typeof value === 'number', 'Value must be a number');
    return value >= condition.ge;
  } else if (condition.gt !== undefined) {
    invariant(typeof value === 'number', 'Value must be a number');
    return value > condition.gt;
  } else if (condition.all !== undefined) {
    return condition.all.every(c => test(c, value));
  } else if (condition.any !== undefined) {
    return condition.any.some(c => test(c, value));
  } if (Object.keys(condition).length === 0) {
    return true;
  }

  throw Error(`Invalid condition ${JSON.stringify(condition)}`);
}

export default class CaseSchema extends Schema<CaseValue> {
  cases: Array<Case>;

  constructor(cases: Array<Case>) {
    super();
    this.cases = cases;
  }

  unpack(buffer: Buffer, offset: number = 0, context: Context = new Context()): CaseValue {
    // Find the first value that is true

    const caseIndex = this.cases.findIndex(({ name, condition }) => {
      const actualValue = context.get(name);
      return test(condition, actualValue);
    });

    if (caseIndex < 0) {
      throw new Error('Failed to match any case');
    }

    const { schema } = this.cases[caseIndex];

    return {
      case: caseIndex,
      value: schema.unpack(buffer, offset, context),
    };
  }

  size(): number {
    return -1;
  }

  sizeOf(value: CaseValue): number {
    invariant(value.case < this.cases.length, `Invalid case index: ${value.case}`);

    const { schema } = this.cases[value.case];
    const size = schema.size();
    return size === -1 ? schema.sizeOf(value.value) : size;
  }
}
