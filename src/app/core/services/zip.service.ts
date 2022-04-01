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
const IVSIZE = 16;

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
          this.decrypt(binary, password);
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
    saveAs(this.pack(), this.dataService.tree.meta.id + '.czip');
  }

  pack(): Blob {
    this.dataService.tree.meta.encryptorVersion = META.version;
    return this.enrypt(this.protoService.getProto());
  }

  enrypt(blocks: BinaryBlock[]): Blob {
    // Encrypt tree
    const key: Uint8Array = this.cryptoService.getKey(this.dataService.password);
    const openTree: Uint8Array = blocks.shift().binary;
    const roundTree: Uint8Array = this.cryptoService.roundBlock(openTree);
    const treeLength: number = roundTree.length;
    const tailLength: number = roundTree.length - openTree.length;
    const tree: Uint8Array = this.cryptoService.encryptCBC(
      roundTree,
      key,
      this.dataService.iv
    );
    // Encrypt blocks
    const encrypted: Uint8Array[] = blocks.map(block => {
      if (block.isModified) {
        return this.cryptoService.encryptCTR(block.binary, block.key);
      } else {
        return block.binary;
      }
    });
    // Pack
    const czipTitle: Uint8Array = AES.utils.utf8.toBytes(META.name + META.version);
    const czipTitleLen = new Uint8Array(1);
    czipTitleLen[0] = czipTitle.length;
    const treeSize: Uint8Array = this.encodingService.int32ToUint8Array(treeLength);
    const tailSize = new Uint8Array(1);
    tailSize[0] = tailLength;
    // Download
    // [8, "CZIP2.46", iv, 9000, 14, tree, blocks]
    return new Blob([
      czipTitleLen,
      czipTitle,
      this.dataService.iv,
      treeSize,
      tailSize,
      tree,
      ...encrypted
    ]);
  }

  decrypt(binary: Uint8Array, password: string): void {
    let i: number = 0;
    // Removes title. E.g. "CZIP2.46"
    const length: number = binary[0];
    i += length + 1;
    // Get iv
    const iv: Uint8Array = binary.slice(i, i + IVSIZE);
    this.dataService.iv = iv;
    i += IVSIZE;
    // Get size of tree
    const treeSize: Uint8Array = binary.slice(i, i + INT32BYTES);
    const treeLength: number = this.encodingService.uint8ArrayToint32(treeSize);
    i += INT32BYTES;
    // Get size of tree tail
    const tailLength: number = binary[i];
    i += 1;
    // Get encrypted tree
    const tree: Uint8Array = binary.slice(i, i + treeLength);
    i += treeLength;
    // Get encrypted blocks
    const blocks: Uint8Array = binary.slice(i);
    this.dataService.blocks = blocks;
    // Decrypt
    const key: Uint8Array = this.cryptoService.getKey(password);
    const roundTree: Uint8Array = this.cryptoService.decryptCBC(tree, key, iv);
    const openTree: Uint8Array = roundTree.slice(0, roundTree.length - tailLength);
    this.protoService.setProto(openTree);
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
      this.dataService.decryptFile(node);
      const blob = new Blob(
        [node.block.binary],
        { type: this.mediaService.getMimeType(node.name) },
      );
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
          file.block.binary,
          {
            binary: true,
            compression: 'DEFLATE',
          },
        );
      }
    }
  }
}
