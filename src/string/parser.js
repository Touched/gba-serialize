/* @flow */

const BACKSLASH = 92;
const SQUARE_BRACKET_LEFT = 91;
const SQUARE_BRACKET_RIGHT = 93;

export type Token = {
  type: 'placeholder' | 'character' | 'escape',
  value: string,
  text: string,
  start: number,
  end: number,
  arguments?: Array<any>,
};

type EscapeCharacterParserParameter = {
  match: RegExp,
  parse?: string => mixed,
};

type EscapeCharacterParser = {
  onParse?: (string, number) => void,
  parameters?: Array<EscapeCharacterParserParameter>,
};

type EscapeCharacterParsers = {
  [name: string]: EscapeCharacterParser,
};

type ParseOptions = {
  escapeCharacterParsers?: EscapeCharacterParsers,
};

export class StringParseError extends Error {
  location: { start: number, end: ?number };
  string: string;

  constructor(string: string, start: number, end: ?number, message: string) {
    super(message);
    this.location = { start, end };
    this.string = string;
    Error.captureStackTrace(this, this.constructor);
  }
}

function readPlaceholder(string: string, pos: number): Token {
  let end = pos;
  const start = pos;

  if (string.charCodeAt(pos + 1) === SQUARE_BRACKET_LEFT) {
    return {
      type: 'character',
      value: '[',
      text: string.slice(pos, pos + 2),
      start: pos,
      end: pos + 2,
    };
  }

  while (end < string.length && string.charCodeAt(end) !== SQUARE_BRACKET_RIGHT) {
    end += 1;
  }

  if (string.charCodeAt(end) !== SQUARE_BRACKET_RIGHT) {
    throw new StringParseError(string, start, end, 'Unterminated placeholder');
  }

  end += 1;
  const text = string.slice(pos, end);
  const token = {
    type: 'placeholder',
    value: text.slice(1, -1),
    text,
    start,
    end,
  };

  if (token.value.match(/\s/)) {
    const [value, ...args] = token.value.split(/\s+/);

    return {
      ...token,
      value,
      arguments: args,
    };
  }

  return token;
}

function readEscape(string: string, pos: number, parsers: EscapeCharacterParsers = {}): Token {
  if (pos + 2 > string.length) {
    throw new StringParseError(string, pos, pos + 2, 'Invalid escape sequence');
  }

  if (string.charCodeAt(pos + 1) === BACKSLASH) {
    const text = string.slice(pos, pos + 2);

    return {
      type: 'character',
      value: text.slice(pos + 1),
      text,
      start: pos,
      end: pos + 2,
    };
  }

  const text = string.slice(pos, pos + 2);
  const value = text.slice(1);

  const parser = parsers[value];
  if (parser) {
    if (parser.onParse) {
      parser.onParse(string, pos);
    }

    if (parser.parameters) {
      let argPos = pos + 2;
      const args = parser.parameters.map(({ match, parse }) => {
        const matches = match.exec(string.slice(argPos));

        if (!matches || matches.index) {
          throw new StringParseError(string, pos + 2, null, `Expected ${String(match)} to match`);
        }

        const argText = matches[0];
        argPos += argText.length;

        return parse ? parse(argText) : parse;
      });

      return {
        type: 'escape',
        value,
        text: string.slice(pos, argPos),
        start: pos,
        end: argPos,
        arguments: args,
      };
    }
  }

  return {
    type: 'escape',
    value,
    text,
    start: pos,
    end: pos + 2,
  };
}

function readCharacter(string: string, pos: number): Token {
  const text = string.slice(pos, pos + 1);

  return {
    type: 'character',
    value: text,
    text,
    start: pos,
    end: pos + 1,
  };
}

export default function fold<T>(
  string: string,
  fn: (T, Token) => T,
  initial: T,
  options: ParseOptions = {},
): T {
  let result = initial;
  let pos = 0;

  while (pos < string.length) {
    let token;
    switch (string.charCodeAt(pos)) {
      case BACKSLASH:
        token = readEscape(string, pos, options.escapeCharacterParsers);
        break;
      case SQUARE_BRACKET_LEFT:
        token = readPlaceholder(string, pos);
        break;
      default:
        token = readCharacter(string, pos);
        break;
    }

    pos = token.end;
    result = fn(result, token);
  }

  return result;
}
