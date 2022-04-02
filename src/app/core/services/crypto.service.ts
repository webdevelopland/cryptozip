import { Injectable } from '@angular/core';
import { sha256 } from 'js-sha256';
import * as AES from 'aes-js';

@Injectable()
export class CryptoService {
  encryptCBC(binary: Uint8Array, key: Uint8Array, iv: Uint8Array): Uint8Array {
    const cipher: AES.ModeOfOperation.ModeOfOperationCBC = new AES.ModeOfOperation.cbc(key, iv);
    return cipher.encrypt(binary);
  }

  decryptCBC(encrypted: Uint8Array, key: Uint8Array, iv: Uint8Array): Uint8Array {
    const cipher: AES.ModeOfOperation.ModeOfOperationCBC = new AES.ModeOfOperation.cbc(key, iv);
    return cipher.decrypt(encrypted);
  }

  encryptCTR(binary: Uint8Array, key: Uint8Array): Uint8Array {
    const cipher: AES.ModeOfOperation.ModeOfOperationCTR = new AES.ModeOfOperation.ctr(key);
    return cipher.encrypt(binary);
  }

  decryptCTR(encrypted: Uint8Array, key: Uint8Array): Uint8Array {
    const cipher: AES.ModeOfOperation.ModeOfOperationCTR = new AES.ModeOfOperation.ctr(key);
    return cipher.decrypt(encrypted);
  }

  // Generate 256 key based on string password
  getKey(password: string): Uint8Array {
    const salt: string = 'sha256czip';
    const hex: string = sha256(password + salt);
    return AES.utils.hex.toBytes(hex);
  }

  // Adds zeros to the end of a block to have 16 block
  roundBlock(binary: Uint8Array): Uint8Array {
    const hole: number = binary.length % 16;
    if (hole !== 0) {
      const add: number = 16 - hole;
      const block: number[] = [];
      for (let i = 0; i < add; i++) {
        block.push(0);
      }
      const extraZero = new Uint8Array(block);
      const binary16 = new Uint8Array(binary.length + extraZero.length);
      binary16.set(binary, 0);
      binary16.set(extraZero, binary.length);
      return binary16;
    }
    return binary;
  }
}
