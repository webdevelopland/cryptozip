import { Injectable } from '@angular/core';
import * as scrypt from 'scrypt-js';
import * as AES from 'src/third-party/aes';

const DEFAULT_COUNTER = 1;
const SALT = Uint8Array.from([
  0, 104, 89, 125, 160, 222, 25, 13, 77, 211,
  132, 150, 16, 44, 249, 79, 216, 241, 246, 14,
  54, 182, 99, 13, 9, 247, 59, 192, 7, 243,
  181, 175, 80, 82, 130, 196, 124, 228, 171, 209,
  151, 15, 251, 83, 184, 127, 216, 85, 16, 137,
  111, 29, 23, 71, 96, 107, 162, 29, 209, 227,
  92, 15, 231, 147, 240, 112, 210, 189, 39, 234,
  77, 42, 9, 41, 187, 115, 198, 200, 142, 255
]);

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

  encryptCTR(binary: Uint8Array, key: Uint8Array, counter = DEFAULT_COUNTER): Uint8Array {
    const cipher: AES.ModeOfOperation.ModeOfOperationCTR = new AES.ModeOfOperation.ctr(
      key,
      new AES.Counter(counter),
    );
    return cipher.encrypt(binary);
  }

  // Generate 256 key based on string password
  getKey(password: string, pow: number): Uint8Array {
    const passwordBytes: Uint8Array = AES.utils.utf8.toBytes(password.normalize('NFKC'));
    const N: number = Math.pow(2, pow);
    const dkLen = 32;
    const r = 8;
    const p = 1;
    return scrypt.syncScrypt(passwordBytes, SALT, N, r, p, dkLen);
  }

  checkRV(block: Uint8Array): boolean {
    for (let i = 0; i < 8; i++) {
      if (block[i] !== 0) {
        return false;
      }
    }
    return true;
  }
}
