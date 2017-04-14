/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import fold from '../parser';

describe('String Parser', () => {
  function explode(string) {
    return fold(string, (exploded, { text }) => [...exploded, text], []);
  }

  function foldArray(string, options) {
    return fold(string, (result, token) => [...result, token], [], options);
  }

  it('should split the string on characters', () => {
    expect(explode('test string')).to.deep.equal([
      't', 'e', 's', 't',
      ' ',
      's', 't', 'r', 'i', 'n', 'g',
    ]);
  });

  it('should parse escape characters', () => {
    expect(explode('escape \\n\\k')).to.deep.equal([
      'e', 's', 'c', 'a', 'p', 'e',
      ' ', '\\n', '\\k',
    ]);
  });

  it('should parse string placeholders', () => {
    expect(explode('this has a [placeholder]')).to.deep.equal([
      't', 'h', 'i', 's', ' ', 'h', 'a', 's', ' ', 'a', ' ', '[placeholder]',
    ]);
  });

  it('should create tokens', () => {
    const [
      character,
      escape,
      placeholder,
    ] = foldArray('a\\b[c]');

    expect(character).to.deep.equal({
      type: 'character',
      start: 0,
      end: 1,
      text: 'a',
      value: 'a',
    });

    expect(escape).to.deep.equal({
      type: 'escape',
      start: 1,
      end: 3,
      text: '\\b',
      value: 'b',
    });

    expect(placeholder).to.deep.equal({
      type: 'placeholder',
      start: 3,
      end: 6,
      text: '[c]',
      value: 'c',
    });
  });

  it('should complain about unterminated placeholders', () => {
    expect(() => {
      fold('[test', x => x, null);
    }).to.throw('Unterminated placeholder');
  });

  it('should complain about bad escape sequences', () => {
    expect(() => {
      fold('no\\', x => x, null);
    }).to.throw('Invalid escape sequence');
  });

  it('insert a backslash character when an escaped backslash is encountered', () => {
    const [backslash] = foldArray('\\\\');

    expect(backslash).to.deep.equal({
      type: 'character',
      start: 0,
      end: 2,
      text: '\\\\',
      value: '\\',
    });
  });

  it('should allow placeholder sequences to be esacped', () => {
    const [character, placeholder] = foldArray('[[[x]');

    expect(character).to.deep.equal({
      type: 'character',
      start: 0,
      end: 2,
      text: '[[',
      value: '[',
    });

    expect(placeholder).to.deep.equal({
      type: 'placeholder',
      start: 2,
      end: 5,
      text: '[x]',
      value: 'x',
    });
  });

  it('parses placeholders that have arguments', () => {
    const [placeholder] = foldArray('[placeholder 2  3]');

    expect(placeholder).to.deep.equal({
      type: 'placeholder',
      start: 0,
      end: 18,
      text: '[placeholder 2  3]',
      value: 'placeholder',
      arguments: ['2', '3'],
    });
  });

  it('parses escape codes with arguments', () => {
    const [escape] = foldArray('\\afffex', {
      escapeCharacterParsers: {
        a: {
          parameters: [{
            match: /[a-f0-9]{2}/i,
            parse: value => parseInt(value, 16),
          }, {
            match: /[a-f0-9]{2}/i,
            parse: value => parseInt(value, 16),
          }],
        },
      },
    });

    expect(escape).to.deep.equal({
      type: 'escape',
      start: 0,
      end: 6,
      text: '\\afffe',
      value: 'a',
      arguments: [255, 254],
    });
  });

  it('filters the escape sequence', () => {
    const options = {
      escapeCharacterParsers: {
        a: {
          onParse(string, pos) {
            throw new Error(`${pos}:${string}`);
          },
        },
      },
    };

    expect(() => {
      foldArray('before\\aafter', options);
    }).to.throw('6:before\\aafter');
  });
});
