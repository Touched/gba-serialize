/* @flow */

import invariant from '../util/invariant';

const NEWLINE = 10;
const BACKSLASH = 92;
const SINGLE_QUOTE = 39;
const EQUALS = 61;
const CARRIAGE_RETURN = 13;
const AT_SYMBOL = 64;

export class CharmapParseError extends Error {
  location: { line: number, column: number, position: number };
  source: string;

  constructor(source: string, line: number, column: number, position: number, message: string) {
    super(message);
    this.location = { line, column, position };
    this.source = source;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class CharmapParser {
  source: string;
  line: number;
  column: number;
  position: number;

  constructor(source) {
    this.source = source;
    this.position = 0;
    this.line = 0;
    this.column = 0;
  }

  incrementLine() {
    this.line += 1;
    this.column = 0;
  }

  incrementPosition(amount = 1) {
    this.position += amount;
    this.column += amount;
  }

  buildError(message: string) {
    return new CharmapParseError(this.source, this.line, this.column, this.position, message);
  }

  invariant(condition: mixed, message: string) {
    if (!condition) {
      throw this.buildError(message);
    }
  }

  isChar(code: number) {
    this.invariant(this.position < this.source.length, 'Unexpected EOF');
    return this.source.charCodeAt(this.position) === code;
  }

  isEOF() {
    return this.position + 1 >= this.source.length;
  }

  match(re: RegExp) {
    this.invariant(this.position < this.source.length, 'Unexpected EOF');
    return this.source.slice(this.position).match(re);
  }

  getMatch(re: RegExp) {
    const match = this.match(re);

    if (match) {
      return match[0];
    }

    throw this.buildError('Invalid character');
  }

  skipWhitespace() {
    while (!this.isEOF() && this.match(/^[^\S\n]/)) {
      this.incrementPosition();
    }
  }

  skipComment() {
    if (this.isChar(AT_SYMBOL)) {
      this.incrementPosition();

      while (!this.isChar(NEWLINE)) {
        this.incrementPosition();
      }
    }
  }

  skipBlanks() {
    while (!this.isEOF()) {
      this.skipWhitespace();

      if (this.isEOF()) {
        break;
      }

      if (this.isChar(NEWLINE)) {
        this.incrementPosition();
        this.incrementLine();
      } else if (this.isChar(AT_SYMBOL)) {
        this.skipComment();
      } else {
        break;
      }
    }
  }

  parseCharacterSequence() {
    if (this.isChar(SINGLE_QUOTE)) {
      this.incrementPosition();

      const isEscape = this.isChar(BACKSLASH);

      if (isEscape) {
        this.incrementPosition();
      }

      const code = this.source.charCodeAt(this.position);
      this.invariant(code > 20, 'Invalid character');

      // Read single unicode character
      const character = this.getMatch(/./u);
      this.incrementPosition(character.length);

      this.invariant(isEscape || character !== '\'', 'Empty character literal');
      this.invariant(this.isChar(SINGLE_QUOTE), 'Unterminated character literal');
      this.incrementPosition();

      if (isEscape) {
        this.invariant(character.match(/[\x00-x7f]/), 'Non-ASCII escape characters are invalid');
        this.invariant(character !== '"', 'Cannot escape a double quote');

        if (character !== "'" && character !== '\\') {
          if (character === '$') {
            return {
              type: 'character',
              value: character,
            };
          }

          return {
            type: 'escape',
            value: character,
          };
        }
      }

      if (character === '$') {
        return {
          type: 'terminator',
          value: character,
        };
      }

      return {
        type: 'character',
        value: character,
      };
    } else if (this.match(/^[_a-z]/i)) {
      const identifier = this.getMatch(/^[_a-z][_a-z0-9]*/i);
      this.incrementPosition(identifier.length);

      return {
        type: 'placeholder',
        value: identifier,
      };
    }

    throw this.buildError('Invalid junk at start of line');
  }

  expectAssignment() {
    this.skipWhitespace();
    this.invariant(this.isChar(EQUALS), 'Expected equals sign');
    this.incrementPosition();
  }

  parseByteSequence() {
    const HEX_CHARACTER = /^[a-f0-9]/i;

    this.skipWhitespace();

    const bytes = [];
    while (!this.isEOF() && this.match(HEX_CHARACTER)) {
      const hex = this.getMatch(/^[a-f0-9]+/i);

      this.invariant(hex.length === 2, 'Each byte must have exactly two digits');
      this.incrementPosition(hex.length);
      this.skipWhitespace();

      bytes.push(parseInt(hex, 16));
    }

    this.invariant(bytes.length, 'Expected byte sequence');

    return new Buffer(bytes);
  }

  nextLine() {
    if (!this.isEOF()) {
      this.skipWhitespace();
      this.skipComment();
      this.invariant(this.isEOF() || this.isChar(NEWLINE), 'Unexpected junk at end of line');
      this.incrementPosition();
      this.incrementLine();
      this.invariant(!this.isChar(CARRIAGE_RETURN), 'Only UNIX line endings supported');
    }
  }

  parse() {
    const map = {
      character: new Map(),
      placeholder: new Map(),
      escape: new Map(),
      terminator: new Map(),
    };

    while (!this.isEOF()) {
      this.skipBlanks();
      const characterSequence = this.parseCharacterSequence();
      this.expectAssignment();
      const byteSequence = this.parseByteSequence();
      this.nextLine();
      this.skipBlanks();

      const { type, value } = characterSequence;

      if (map[type].has(value)) {
        throw new Error(`Redefining ${type} sequence: ${value}`);
      }

      map[type].set(value, byteSequence);
    }

    return map;
  }
}

type CharacterMap = {
  character: Map<string, Buffer>,
  placeholder: Map<string, Buffer>,
  escape: Map<string, Buffer>,
  terminator: Map<string, Buffer>,
};

export default class Charmap {
  map: CharacterMap;

  constructor(map: CharacterMap) {
    invariant(map.terminator.size === 1, 'There must be exactly one terminator character');
    invariant(map.terminator.get('$'), 'The terminator character must be a $');
    this.map = map;
  }

  static parse(source) {
    const parser = new CharmapParser(source);
    return new Charmap(parser.parse());
  }

  fetch(type: $Keys<CharacterMap>, key: string): ?Buffer {
    return this.map[type].get(key);
  }
}
