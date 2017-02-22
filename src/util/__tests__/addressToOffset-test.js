/* @flow */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import addressToOffset from '../addressToOffset';

describe('Util: addressToOffset', () => {
  it('converts a ROM address to an offset', () => {
    expect(addressToOffset(0x08123456)).to.equal(0x123456);
    expect(addressToOffset(0x09123456)).to.equal(0x01123456);

    expect(addressToOffset(0x0A123456)).to.equal(0x123456);
    expect(addressToOffset(0x0B123456)).to.equal(0x01123456);

    expect(addressToOffset(0x0C123456)).to.equal(0x123456);
    expect(addressToOffset(0x0D123456)).to.equal(0x01123456);
  });

  it('throws an error if the address is invalid', () => {
    const invalidAddresses = [
      0xFFFFFFFF,
      0x10000000,
      0x00004000,
      0x02040000,
      0x03008000,
      0x040003FF,
      0x05000400,
      0x06018000,
      0x07000400,
      0xE0100000,
    ];

    invalidAddresses.forEach((address) => {
      expect(() => addressToOffset(address)).to.throw('Invalid address');
    });
  });

  it('throws an error if the address is not in ROM', () => {
    const notROMAddresses = [
      0x00000000,
      0x02000000,
      0x03000000,
      0x04000000,
      0x05000000,
      0x06000000,
      0x07000000,
      0x0E000000,
    ];

    notROMAddresses.forEach((address) => {
      expect(() => addressToOffset(address)).to.throw('Address must be in ROM');
    });
  });
});
