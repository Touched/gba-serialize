/* @flow */

import Charmap from './charmap';
import fold from './parser';
import type { Token } from './parser';
import invariant from '../util/invariant';
import CustomError from '../util/error';

export class EncodingError extends CustomError {
  string: string;
  token: Token;

  constructor(string: string, token: Token, message: string) {
    super(message);
    this.string = string;
    this.token = token;
  }
}

export default function encode(string: string, charmap: Charmap): Buffer {
  function encoder(buffer: Buffer, token: Token): Buffer {
    const sequence = charmap.fetch(token.type, token.value);

    if (token.type === 'escape' && token.value === 'x') {
      invariant(token.arguments, 'Hex escape sequence requires arguments');
      const byte = token.arguments[0];
      return Buffer.concat([buffer, new Buffer([byte])]);
    }

    if (sequence) {
      if (token.type === 'placeholder' && token.arguments) {
        const args = token.arguments.reduce((argBuffer, arg) => {
          if (arg.match(/^\d+$/)) {
            return Buffer.concat([argBuffer, new Buffer([parseInt(arg, 10)])]);
          }

          const placeholder = charmap.fetch('placeholder', arg);

          if (placeholder) {
            return Buffer.concat([argBuffer, placeholder]);
          }

          throw new EncodingError(string, token, `Invalid placeholder: ${arg}`);
        }, new Buffer([]));

        return Buffer.concat([buffer, sequence, args]);
      }

      return Buffer.concat([buffer, sequence]);
    }

    throw new EncodingError(string, token, 'Invalid token type');
  }

  const terminator = charmap.map.terminator.get('$');
  invariant(terminator, 'Character map must contain a terminator character');

  return Buffer.concat([fold(string, encoder, new Buffer([]), {
    escapeCharacterParsers: {
      x: {
        parameters: [{
          match: /[a-f0-9]{2}/i,
          parse: value => parseInt(value, 16),
        }],
      },
    },
  }), terminator]);
}
