/* @flow */

/* eslint-disable no-bitwise */

function validateRange(address: number, start: number, end: number) {
  if (address >= start && address < end) {
    throw new Error('Address must be in ROM');
  } else {
    throw new Error('Invalid address');
  }
}

export default function addressToOffset(address: number): number {
  switch (address >> 24) {
    case 0x8:
    case 0x9:
      return address - 0x08000000;
    case 0xA:
    case 0xB:
      return address - 0x0A000000;
    case 0xC:
    case 0xD:
      return address - 0x0C000000;
    case 0x0:
      validateRange(address, 0, 0x4000);
      break;
    case 0x2:
      validateRange(address, 0x02000000, 0x02040000);
      break;
    case 0x3:
      validateRange(address, 0x03000000, 0x03008000);
      break;
    case 0x4:
      validateRange(address, 0x04000000, 0x040003FF);
      break;
    case 0x5:
      validateRange(address, 0x05000000, 0x05000400);
      break;
    case 0x6:
      validateRange(address, 0x06000000, 0x06018000);
      break;
    case 0x7:
      validateRange(address, 0x07000000, 0x07000400);
      break;
    case 0xE:
      validateRange(address, 0x0E000000, 0xE0100000);
      break;
    default:
      validateRange(address, 0, 0);
      break;
  }

  return 0;
}
