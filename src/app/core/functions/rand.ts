import {
  rand,
  randstr64,
  randCustomString,
  numerals,
} from 'rndmjs';

export function generateId(): string {
  return randCustomString(numerals, 9);
}

export function getNodeId(): string {
  return randstr64(20);
}

export function getRandomKey(): Uint8Array {
  return getRandomBlock(32);
}

export function getIV(): Uint8Array {
  return getValueBlock(1, 16);
}

// Returns a vector for password verification,
// but half random to avoid "known plaintext" vulnerability
export function getRV(): Uint8Array {
  const block: Uint8Array = getRandomBlock(16);
  for (let i = 0; i < 8; i++) {
    block[i] = 0;
  }
  return block;
}

export function getRandomBlock(size: number = 16): Uint8Array {
  const block: number[] = [];
  for (let i = 0; i < size; i++) {
    block.push(rand(0, 255));
  }
  return new Uint8Array(block);
}

export function getValueBlock(value: number, size: number = 16) {
  const block: number[] = [];
  for (let i = 0; i < size; i++) {
    block.push(value);
  }
  return new Uint8Array(block);
}

export function getEmptyBlock(size: number = 16) {
  return getValueBlock(0, size);
}
