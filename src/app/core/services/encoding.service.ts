import { Injectable } from '@angular/core';

@Injectable()
export class EncodingService {
  // Converts uint8array binary to base64 string
  uint8ArrayToBase64(binary: Uint8Array): string {
    return btoa(new Uint8Array(binary).reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''));
  }

  // Converts base64 string to uint8array binary
  base64ToUint8Array(base64: string): Uint8Array {
    const raw: string = window.atob(base64);
    const uint8Array = new Uint8Array(new ArrayBuffer(raw.length));
    for (let i = 0; i < raw.length; i++) {
      uint8Array[i] = raw.charCodeAt(i);
    }
    return uint8Array;
  }

  int32ToUint8Array(int32: number): Uint8Array {
    return Uint8Array.of(
      (int32 & 0xff000000) >> 24,
      (int32 & 0x00ff0000) >> 16,
      (int32 & 0x0000ff00) >> 8,
      (int32 & 0x000000ff) >> 0,
    );
  }

  uint8ArrayToint32(binary: Uint8Array, start: number = 0): number {
    const bytes: Uint8Array = binary.subarray(start, start + 4);
    let n: number = 0;
    for (const byte of bytes.values()) {
      n = (n << 8) | byte;
    }
    return n;
  }
}
