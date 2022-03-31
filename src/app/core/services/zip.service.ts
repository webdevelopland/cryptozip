import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import * as AES from 'aes-js';

import { Node, File, Folder, BinaryBlock } from '@/core/type';
import { CryptoService } from './crypto.service';
import { MediaService } from './media.service';
import { DataService } from './data.service';
import { ProtoService } from './proto.service';
import { LoadingService } from './loading.service';
import { EncodingService } from './encoding.service';
import { META } from '@/environments/meta';

const INT32BYTES = 4;

@Injectable()
export class ZipService {
  constructor(
    private cryptoService: CryptoService,
    private mediaService: MediaService,
    private dataService: DataService,
    private protoService: ProtoService,
    private loadingService: LoadingService,
    private encodingService: EncodingService,
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
    this.dataService.data.meta.encryptorVersion = META.version;
    const blocks: BinaryBlock[] = this.protoService.getProto();
    return this.enrypt(blocks, this.dataService.password);
  }

  enrypt(blocks: BinaryBlock[], password: string): Blob {
    // Encrypt
    const encrypted: Uint8Array[] = blocks.map(block => {
      if (block.isDecrypted) {
        return this.cryptoService.encrypt(block.binary, password);
      } else {
        return block.binary;
      }
    });
    // Add header
    const czipHeader: Uint8Array = AES.utils.utf8.toBytes(META.header + META.version);
    const czipHeaderLen: Uint8Array = new Uint8Array(1);
    czipHeaderLen[0] = czipHeader.length;
    const mapSize: Uint8Array = this.encodingService.int32ToUint8Array(encrypted[0].length);
    // Download
    return new Blob([czipHeaderLen, czipHeader, mapSize, ...encrypted]);
  }

  unpack(binary: Uint8Array, password: string): void {
    const base: Uint8Array = this.removeHeader(binary);
    const mapSizeBinary: Uint8Array = base.slice(0, INT32BYTES);
    const mapSize: number = this.encodingService.uint8ArrayToint32(mapSizeBinary);
    const encrypted: Uint8Array = base.slice(INT32BYTES, INT32BYTES + mapSize);
    const blocks: Uint8Array = base.slice(INT32BYTES + mapSize);
    this.dataService.blocks = blocks;
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

  export(node: Node, name: string): void {
    this.loadingService.loads++;
    const jszip = new JSZip();
    if (node instanceof Folder) {
      const root: JSZip = jszip.folder(name);
      this.addFolderToZip(root, node);
      jszip.generateAsync({ type: 'blob' }).then(blob => {
        saveAs(blob, name + '.zip');
        this.loadingService.loads--;
      });
    } else if (node instanceof File) {
      let blob: Blob;
      this.dataService.decryptFile(node);
      if (!node.isBinary) {
        // Download as text
        blob = new Blob(
          [node.text],
          { type: this.mediaService.getMimeType(node.name) },
        );
      } else {
        // Download as binary
        blob = new Blob(
          [node.block.binary],
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
        this.dataService.decryptFile(file);
        jszip.file(
          file.name,
          file.isBinary ? file.block.binary : file.text,
          {
            binary: file.isBinary,
            compression: 'DEFLATE',
          },
        );
      }
    }
  }
}
