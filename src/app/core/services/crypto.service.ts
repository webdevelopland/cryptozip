import { Injectable } from '@angular/core';
import { sha256 } from 'js-sha256';
import * as AES from 'aes-js';

@Injectable()
export class CryptoService {
  decrypt(encrypted: Uint8Array, password: string): Uint8Array {
    // Password
    const key: Uint8Array = this.getKey(password);
    // Decrypt
    const aesCtr: AES.ModeOfOperation.ModeOfOperationCTR = new AES.ModeOfOperation.ctr(key);
    return aesCtr.decrypt(encrypted);
  }

  encrypt(binary: Uint8Array, password: string): Uint8Array {
    // Password
    const key: Uint8Array = this.getKey(password);
    // Encrypt
    var aesCtr: AES.ModeOfOperation.ModeOfOperationCTR = new AES.ModeOfOperation.ctr(key);
    return aesCtr.encrypt(binary);
  }

  // Generate 256 key
  private getKey(password: string): Uint8Array {
    const salt: string = 'sha256czip';
    const hex: string = sha256(password + salt);
    return AES.utils.hex.toBytes(hex);
  }
}
