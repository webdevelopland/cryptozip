import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import * as AES from 'aes-js';

import { Node, File, Folder } from '@/core/type';
import { CryptoService } from './crypto.service';
import { MediaService } from './media.service';
import { DataService } from './data.service';
import { ProtoService } from './proto.service';
import { LoadingService } from './loading.service';
import { META } from '@/environments/meta';

@Injectable()
export class ZipService {
  constructor(
    private cryptoService: CryptoService,
    private mediaService: MediaService,
    private dataService: DataService,
    private protoService: ProtoService,
    private loadingService: LoadingService,
  ) { }

  unzip(fileList: FileList, password: string): Observable<void> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(fileList.item(0));
      reader.onload = () => {
        const binary = new Uint8Array(reader.result as ArrayBuffer);
        try {
          this.unpack(binary, password);
          observer.next();
        } catch (e) {
          observer.error();
        }
      };
      reader.onerror = () => {
        observer.error();
      };
    });
  }

  zip(): void {
    saveAs(this.pack(), this.dataService.data.meta.id + '.czip');
  }

  pack(): Blob {
    const binary: Uint8Array = this.protoService.getProto();
    return this.enrypt(binary, this.dataService.password);
  }

  enrypt(binary: Uint8Array, password: string): Blob {
    // Encrypt
    const encrypted: Uint8Array = this.cryptoService.enrypt(binary, password);
    // Add header
    const czipHeader: Uint8Array = AES.utils.utf8.toBytes(META.header + META.version);
    const czipHeaderLen: Uint8Array = new Uint8Array(1);
    czipHeaderLen[0] = czipHeader.length;
    // Download
    return new Blob([czipHeaderLen, czipHeader, encrypted]);
  }

  unpack(binary: Uint8Array, password: string): void {
    const encrypted: Uint8Array = this.removeHeader(binary);
    const decrypted: Uint8Array = this.cryptoService.decrypt(encrypted, password);
    this.protoService.setProto(decrypted);
  }

  // Removes czip header
  // E.g. "CZIP2.46"
  private removeHeader(binary: Uint8Array): Uint8Array {
    // First byte is length of header
    const length: number = binary[0];
    return binary.slice(length + 1);
  }

  export(node: Node): void {
    this.loadingService.loads++;
    const jszip = new JSZip();
    if (node instanceof Folder) {
      const root: JSZip = jszip.folder(node.name);
      this.addFolderToZip(root, node);
      jszip.generateAsync({ type: 'blob' }).then(blob => {
        saveAs(blob, node.name + '.zip');
        this.loadingService.loads--;
      });
    } else if (node instanceof File) {
      let blob: Blob;
      if (!node.isBinary) {
        // Download as text
        blob = new Blob(
          [node.text],
          { type: 'text/plain;charset=utf-8' },
        );
      } else {
        // Download as binary
        blob = new Blob(
          [node.binary],
          { type: this.mediaService.getMimeType(node.name) },
        );
      }
      saveAs(blob, node.name);
      this.loadingService.loads--;
    }
  }

  private addFolderToZip(jszip: JSZip, folder: Folder): void {
    for (const node of folder.nodes) {
      if (node instanceof Folder) {
        const zipFolder: JSZip = jszip.folder(node.name);
        this.addFolderToZip(zipFolder, node);
      } else {
        const file = node as File;
        jszip.file(
          file.name,
          file.isBinary ? file.binary : file.text,
          {
            binary: file.isBinary,
            compression: 'DEFLATE',
          },
        );
      }
    }
  }
}
