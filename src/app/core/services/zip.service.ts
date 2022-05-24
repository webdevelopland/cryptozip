import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import * as AES from 'src/third-party/aes';

import { Node, File, Folder, BinaryBlock, ZipError } from '@/core/type';
import { getIV, mergeUint8Arrays } from '@/core/functions';
import { CryptoService } from './crypto.service';
import { MediaService } from './media.service';
import { DataService } from './data.service';
import { ProtoService } from './proto.service';
import { LoadingService } from './loading.service';
import { EncodingService } from './encoding.service';
import { META } from '@/environments/meta';

const INT32BYTES = 4;
const BLOCKSIZE = 16;

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
          if (e.message === 'Invalid password') {
            observer.error(ZipError.WRONG_PASS);
          } else {
            observer.error(ZipError.UNDEFINED);
          }
        }
      };
      reader.onerror = () => {
        observer.error(ZipError.FILE_READER);
      };
    });
  }

  zip(): void {
    const blob = new Blob([this.pack()]);
    saveAs(blob, this.dataService.tree.meta.id + '.czip');
  }

  pack(): Uint8Array {
    this.dataService.tree.meta.encryptorVersion = META.version;
    return this.enrypt(this.protoService.getProto());
  }

  enrypt(blocks: BinaryBlock[]): Uint8Array {
    // Encrypt tree
    const key: Uint8Array = this.cryptoService.getKey(
      this.dataService.password,
      this.dataService.pow,
    );
    const tree: Uint8Array = blocks.shift().binary;
    const treeRV = new Uint8Array([...this.dataService.rv, ...tree]);
    const paddingTree: Uint8Array = AES.padding.pkcs7.pad(treeRV);
    const treeLength: number = paddingTree.length;
    const RVT: Uint8Array = this.cryptoService.encryptCBC(
      paddingTree,
      key,
      getIV(),
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
    const treeSize: Uint8Array = this.encodingService.uint32ToUint8Array(treeLength);
    const pow = new Uint8Array(1);
    pow[0] = this.dataService.pow;
    // Download
    // [8, "CZIP2.46", 12, 9000, rv, tree, blocks]
    return mergeUint8Arrays(
      czipTitleLen,
      czipTitle,
      pow,
      treeSize,
      RVT,
      ...encrypted,
    );
  }

  decrypt(binary: Uint8Array, password: string): void {
    let i: number = 0;
    // Removes title. E.g. "CZIP2.46"
    const length: number = binary[0];
    i += length + 1;
    // Get CostFactor (N=2^pow)
    this.dataService.pow = binary[i];
    i += 1;
    // Get size of tree
    const treeSize: Uint8Array = binary.slice(i, i + INT32BYTES);
    const treeLength: number = this.encodingService.uint8ArrayToUint32(treeSize);
    i += INT32BYTES;
    // Get rv
    const key: Uint8Array = this.cryptoService.getKey(password, this.dataService.pow);
    const iv: Uint8Array = getIV();
    const encryptedRV: Uint8Array = binary.slice(i, i + BLOCKSIZE);
    this.dataService.rv = this.cryptoService.decryptCBC(encryptedRV, key, iv);
    if (!this.cryptoService.checkRV(this.dataService.rv)) {
      throw new Error('Invalid password');
    }
    // Get encrypted tree
    const RVT: Uint8Array = binary.slice(i, i + treeLength);
    i += treeLength;
    // Get encrypted blocks
    const blocks: Uint8Array = binary.slice(i);
    this.dataService.blocks = blocks;
    // Decrypt
    const paddingTree: Uint8Array = this.cryptoService.decryptCBC(RVT, key, iv);
    const treeRV: Uint8Array = AES.padding.pkcs7.strip(paddingTree);
    const tree: Uint8Array = treeRV.slice(BLOCKSIZE);
    this.protoService.setProto(tree);
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
