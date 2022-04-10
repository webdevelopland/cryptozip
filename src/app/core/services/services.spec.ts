import { TestBed } from '@angular/core/testing';

import { EncodingService } from './encoding.service';

describe('EncodingService', () => {
  let encodingService: EncodingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: EncodingService }] });
    encodingService = TestBed.inject(EncodingService);
  });

  it('should be created', () => {
    expect(encodingService).toBeTruthy();
  });

  it('should convert from number to uint32 and back', () => {
    const uint32Array: number[] = [
      0, 1, 2, 3,
      15, 16, 17,
      19, 20, 21,
      30, 40, 50,
      99, 100, 101,
      255, 256, 257,
      999, 1000, 1001,
      9999, 99999, 999999, 9999999,
      2147483646, 2147483647, 2147483648,
      4294967294, 4294967295,
    ];
    const intArray: number[] = [
      -1, -2, -3,
      4294967296,
      9999999999,
      9223372036854775807,
      18446744073709551615,
    ];
    function roundtrip(uint32: number): number {
      const uint8Array: Uint8Array = encodingService.uint32ToUint8Array(uint32);
      return encodingService.uint8ArrayToUint32(uint8Array);
    }
    for (const uint32 of uint32Array) {
      expect(uint32).toEqual(roundtrip(uint32));
    }
    for (const int of intArray) {
      expect(int).not.toEqual(roundtrip(int));
    }
  });
});
