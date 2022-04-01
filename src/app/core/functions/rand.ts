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
  return getRandomBlock(16);
}

export function getRandomBlock(size: number): Uint8Array {
  const block: number[] = [];
  for (let i = 0; i < size; i++) {
    block.push(rand(0, 255));
  }
  return new Uint8Array(block);
}
