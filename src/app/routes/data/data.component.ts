import { Component } from '@angular/core';
import { sha256 } from 'js-sha256';
import * as AES from 'aes-js';
import * as JSZip from 'jszip';

import { content, content2 } from './zip';

@Component({
  selector: 'page-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
})
export class DataComponent {
  zip(): void {
    var zip = new JSZip();
    // { binary: true }
    zip.file("lorem.txt", content2, { compression: "DEFLATE" });
    zip.generateAsync({ type: "uint8array" }).then(res => {
      console.log(res);
    });
  }

  testAES(): void {
    // Password
    const pass: string = 'mypass';

    // Message
    const msg: string = 'pepega';
    const bytesMessage: Uint8Array = AES.utils.utf8.toBytes(msg);

    // Generate 256 key
    const salt: string = 'aes256sha';
    const hex: string = sha256(pass + salt);
    const key: Uint8Array = AES.utils.hex.toBytes(hex);

    // Encrypt
    var aesCtr: AES.ModeOfOperation.ModeOfOperationCTR = new AES.ModeOfOperation.ctr(key);
    var encryptedBytes: Uint8Array = aesCtr.encrypt(bytesMessage);

    // Decrypt
    var aesCtr: AES.ModeOfOperation.ModeOfOperationCTR = new AES.ModeOfOperation.ctr(key);
    var decryptedBytes: Uint8Array = aesCtr.decrypt(encryptedBytes);
    const decrypted: string = AES.utils.utf8.fromBytes(decryptedBytes);
    console.log(decrypted);
  }
}
