/* @flow */

import Charmap from './charmap';
import invariant from '../util/invariant';

type Entity = {
  type: 'character' | 'placeholder' | 'escape' | 'terminator',
  value: string,
};

type State = {
  accept: false,
  next: Map<number, State>,
} | {
  accept: true,
  next: Map<number, State>,
  entity: Entity,
};

/**
 * Deterministic Finite Automaton for matching entities in the given charmap.
 */
class DecoderDFA {
  start: State;
  compiled: ?((Buffer, number) => ?{ pos: number, entity: Entity });

  constructor() {
    this.start = {
      accept: false,
      next: new Map(),
    };
  }

  /**
   * Create the necessary states from the buffer and add them to the DFA.
   */
  addStates(buffer: Buffer, entity: Entity) {
    invariant(buffer.length, 'Buffer cannot be empty');
    const bytes = Array.from(buffer.values());

    let currentState = this.start;

    bytes.forEach((byte, index) => {
      const possibleNextState = currentState.next.get(byte);

      if (possibleNextState) {
        if (index === bytes.length - 1) {
          const newNextState = {
            accept: true,
            next: possibleNextState.next,
            entity,
          };

          currentState.next.set(byte, newNextState);
        } else {
          currentState = possibleNextState;
        }
      } else {
        const nextState = index === bytes.length - 1 ? {
          accept: true,
          next: new Map(),
          entity,
        } : {
          accept: false,
          next: new Map(),
        };

        currentState.next.set(byte, nextState);
        currentState = nextState;
      }
    });
  }

  /**
   * Return the next match at `startPos` for `buffer` or null if there was no match.
   */
  match(buffer: Buffer, startPos: number = 0): ?{ pos: number, entity: Entity } {
    let pos = startPos;
    let currentState = this.start;

    while (currentState) {
      const byte = buffer[pos];

      if (currentState.accept) {
        if (!currentState.next.size) {
          return {
            entity: currentState.entity,
            pos,
          };
        }

        const nextState = currentState.next.get(byte);

        if (!nextState) {
          return {
            entity: currentState.entity,
            pos,
          };
        }

        pos += 1;
        currentState = nextState;
      } else {
        invariant(currentState.next.size > 0, 'State must have at least one next state');

        const nextState = currentState.next.get(byte);

        if (!nextState) {
          return null;
        }

        pos += 1;
        currentState = nextState;
      }
    }

    return null;
  }
}

export default function buildDecoder(charmap: Charmap): (Buffer, n: ?number) => [number, string] {
  const dfa = new DecoderDFA();

  ['terminator', 'escape', 'placeholder', 'character'].forEach(type =>
    charmap.map[type].forEach((buffer, string) =>
      dfa.addStates(buffer, { type, value: string }),
    ),
  );

  return function decode(buffer: Buffer, maxLength: ?number): [number, string] {
    let pos = 0;
    let result = '';

    while (pos < (maxLength || buffer.length)) {
      const match = dfa.match(buffer, pos);

      if (match) {
        pos = match.pos;
        const { type, value } = match.entity;

        switch (type) {
          case 'character':
            result += value;
            break;
          case 'placeholder':
            result += `[${value}]`;
            break;
          case 'escape':
            result += `\\${value}`;
            break;
          case 'terminator':
            return [pos, result];
          default:
            throw new Error(`Invalid entity: ${type}`);
        }
      } else {
        result += `\\x${buffer[pos].toString().padStart(2, '0')}`;
        pos += 1;
      }
    }

    return [pos, result];
  };
}
