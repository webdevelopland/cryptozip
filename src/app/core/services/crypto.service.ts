import { Injectable } from '@angular/core';
import { sha256 } from 'js-sha256';
import * as AES from 'src/third-party/aes';

const DEFAULT_COUNTER = 1;

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
  getKey(password: string): Uint8Array {
    const salt: string = 'sha256czip';
    const hex: string = sha256(password + salt);
    return AES.utils.hex.toBytes(hex);
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
