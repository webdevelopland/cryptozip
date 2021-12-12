import { Injectable } from '@angular/core';
import { Observable, zip } from 'rxjs';
import { randCustomString, numerals } from 'rndmjs';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import * as AES from 'aes-js';

import { File, Folder, Data, Parse } from '@/core/type';
import { CryptoService } from './crypto.service';
import { parsePath } from '@/core/functions';
import { META } from '@/environments/meta';

@Injectable()
export class ZipService {
  constructor(
    private cryptoService: CryptoService,
  ) { }

  generateId(): string {
    return randCustomString(numerals, 9);
  }

  unzip(fileList: FileList, password: string): Observable<Data> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(fileList.item(0));
      reader.onload = () => {
        const fileBinary = new Uint8Array(reader.result as ArrayBuffer);
        const encrypted: Uint8Array = this.removeHeader(fileBinary);
        const decrypted: Uint8Array = this.cryptoService.decrypt(encrypted, password);
        this.binaryToData(decrypted).subscribe(
          data => observer.next(data),
          () => observer.error(),
        );
      };
      reader.onerror = () => {
        observer.error();
      };
    });
  }

  zip(data: Data, password: string): void {
    const jszip = new JSZip();
    const root: JSZip = jszip.folder(data.root.name);
    this.addFolderToZip(root, data.root);
    this.addMeta(jszip, data);
    jszip.generateAsync({ type: 'uint8array' }).then(binary => {
      this.download(binary, password, data.meta.id);
    });
  }

  private download(binary: Uint8Array, password: string, name: string): void {
    // Encrypt
    const encrypted: Uint8Array = this.cryptoService.enrypt(binary, password);
    // Add header
    const czipHeader: Uint8Array = AES.utils.utf8.toBytes(META.header + META.version);
    const czipHeaderLen: Uint8Array = new Uint8Array(1);
    czipHeaderLen[0] = czipHeader.length;
    // Download
    saveAs(new Blob([czipHeaderLen, czipHeader, encrypted]), name + '.czip');
  }

  private binaryToData(binary: Uint8Array): Observable<Data> {
    return new Observable(observer => {
      JSZip.loadAsync(binary).then(zipContent => {
        const fileList: any[] = [];
        const folderList: Folder[] = [];
        const zipNodeList: any[] = Object.values(zipContent.files);
        zipNodeList.forEach(zipNode => {
          if (zipNode.dir) {
            // Folder
            const path: string = this.getPath(zipNode.name.substr(0, zipNode.name.length - 1));
            const folder: Folder = this.getFolder(path);
            folderList.push(folder);
          } else {
            // File
            fileList.push(zipNode);
          }
        });
        this.convertZipFiles(fileList).subscribe(files => {
          const nodeList: (File | Folder)[] = [...folderList, ...files];
          // Put folders before their children and folder before files
          nodeList.sort((a, b) => {
            const aNodeLength: number = a.path.split('/').length;
            const bNodeLength: number = b.path.split('/').length;
            const aFolderStatus: number = a.isFolder() ? 1 : 0;
            const bFolderStatus: number = b.isFolder() ? 1 : 0;
            return (aNodeLength - aFolderStatus) - (bNodeLength - bFolderStatus);
          });
          let metaJson: any;
          for (const node of nodeList) {
            // Get meta
            if (node.path === '/meta.json') {
              metaJson = JSON.parse((node as File).text)
              continue;
            }
            // Convert list to tree
            this.addToTree(nodeList, node);
          }
          const data = new Data();
          data.root = nodeList[0] as Folder;
          data.meta = {
            id: metaJson.id,
            encryptorVersion: metaJson.encryptorVersion,
            updateVersion: metaJson.updateVersion,
            createdTimestamp: metaJson.createdTimestamp,
            updatedTimestamp: metaJson.updatedTimestamp,
          };
          observer.next(data);
        })
      }, error => {
        observer.error();
      });
    });
  }

  // Adds a node to tree
  addToTree(nodeList: (File | Folder)[], newNode: File | Folder): void {
    const parent: string = parsePath(newNode.path).parent;
    for (const node of nodeList) {
      if (node.path === parent && node.isFolder()) {
        (node as Folder).nodes.push(newNode);
      }
    }
  }

  // Converts zip files to File[]
  private convertZipFiles(fileList: any[]): Observable<File[]> {
    if (fileList.length > 0) {
      const observableList: Observable<File>[] = [];
      fileList.forEach(zipFile => {
        observableList.push(new Observable(observer => {
          const file: File = this.getFile(this.getPath(zipFile.name));
          // TODO: handle binary
          zipFile.async('string').then(data => {
            file.text = data;
            observer.next(file);
          });
        }));
      });
      return zip(...observableList);
    } else {
      return new Observable(observer => observer.next([]));
    }
  }

  getPath(name: string): string {
    if (!name.startsWith('/')) {
      name = '/' + name;
    }
    return name;
  }

  // Removes czip header
  // E.g. "CZIP2.46"
  private removeHeader(binary: Uint8Array): Uint8Array {
    // First byte is length of header
    const length: number = binary[0];
    return binary.slice(length + 1);
  }

  // Add meta file
  private addMeta(zip: JSZip, data: Data): void {
    zip.file(
      'meta.json',
      JSON.stringify(data.meta),
      { compression: "DEFLATE" },
    );
  }

  private addFolderToZip(jszip: JSZip, folder: Folder): void {
    for (const node of folder.nodes) {
      if (node.isFolder()) {
        const zipFolder: JSZip = jszip.folder(node.name);
        this.addFolderToZip(zipFolder, node as Folder);
      } else {
        const file = node as File;
        // TODO: handle binary
        jszip.file(
          file.name,
          file.text,
          { compression: "DEFLATE" },
        );
      }
    }
  }

  getFile(path: string, id?: string): File {
    const file = new File();
    if (id) {
      file.id = id;
    }
    file.path = path;
    const parse: Parse = parsePath(path);
    file.name = parse.name;
    return file;
  }

  getFolder(path: string, id?: string): Folder {
    const folder = new Folder();
    if (id) {
      folder.id = id;
    }
    folder.path = path;
    const parse: Parse = parsePath(path);
    folder.name = parse.name;
    return folder;
  }
}
