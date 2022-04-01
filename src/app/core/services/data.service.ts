import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { randCustomString, numerals } from 'rndmjs';

import { Data, Node, File, Folder, NodeMap, StringMap, Parse } from '@/core/type';
import { parsePath, getName } from '@/core/functions';
import { CryptoService } from './crypto.service';
import { NodeService } from './node.service';
import { META } from '@/environments/meta';

@Injectable()
export class DataService {
  isDecrypted: boolean = false;
  isModified: boolean = false;
  isFileModified: boolean = false;
  id: string;
  password: string;
  data: Data;
  nodeMap: NodeMap = {};
  pathMap: StringMap = {};
  blocks: Uint8Array;
  dataChanges = new Subject<void>();

  constructor(
    private router: Router,
    private cryptoService: CryptoService,
    private nodeService: NodeService,
  ) { }

  setData(data: Data): void {
    this.data = data;
    this.nodeMap = {};
    this.pathMap = {};
    this.refresh(this.data.root);
    this.nodeService.getNodeInfo(this.data.root);
    this.id = data.meta.id;
    this.dataChanges.next();
    this.isDecrypted = true;
  }

  modify(): void {
    this.nodeMap = {};
    this.pathMap = {};
    this.refresh(this.data.root);
    this.nodeService.getNodeInfo(this.data.root);
    this.isModified = true;
  }

  update(): void {
    if (this.isModified) {
      this.data.meta.updateVersion++;
      const now = Date.now();
      this.data.meta.updatedTimestamp = now;
      this.data.root.updatedTimestamp = now;
      this.isModified = false;
    }
  }

  private refresh(folder: Folder): void {
    this.nodeMap[folder.id] = folder;
    this.pathMap[folder.path] = folder.id;
    folder.nodes.forEach(node => {
      this.nodeMap[node.id] = node;
      this.pathMap[node.path] = node.id;
      if (node instanceof Folder) {
        this.refresh(node);
      }
    });
    this.sort(folder);
  }

  sortAll(sortBy?: string): void {
    this.refresh(this.data.root);
    for (const node of Object.values(this.nodeMap)) {
      if (node instanceof Folder) {
        this.sort(node, sortBy);
      }
    }
  }

  sort(folder: Folder, sortBy?: string): void {
    folder.nodes.sort((a, b) => {
      folder.sortBy = sortBy || folder.sortBy;
      switch (folder.sortBy) {
        case 'az': return a.name.localeCompare(b.name);
        case 'modified': return b.updatedTimestamp - a.updatedTimestamp;
        case 'size': return b.size - a.size;
        default: return this.sortABDefault(a, b);
      }
    });
  }

  sortABDefault(a: Node, b: Node): number {
    // Show parents before children
    const indexStatus: number = b.index - a.index;
    // Show parents before children
    const aNodeLength: number = parsePath(a.path).length;
    const bNodeLength: number = parsePath(b.path).length;
    const lengthStatus: number = aNodeLength - bNodeLength;
    // Show folder before files
    const aFolderStatus: number = a.isFolder ? 1 : 0;
    const bFolderStatus: number = b.isFolder ? 1 : 0;
    const folderStatus: number = bFolderStatus - aFolderStatus;
    if (indexStatus !== 0) {
      return indexStatus;
    } else if (lengthStatus !== 0) {
      return lengthStatus;
    } else if (folderStatus !== 0) {
      return folderStatus;
    } else {
      return this.compareStrings(a, b);
    }
  }

  compareStrings(a: Node, b: Node): number {
    const nameA: string = getName(a.name, a.isFolder);
    const nameB: string = getName(b.name, b.isFolder);
    const regExpA: RegExpMatchArray = nameA.match(/.+?_([0-9]+)/);
    const regExpB: RegExpMatchArray = nameB.match(/.+?_([0-9]+)/);
    if (regExpA && regExpA[1] && regExpB && regExpB[1]) {
      return parseInt(regExpA[1]) - parseInt(regExpB[1]);
    } else if (nameA.startsWith(nameB)) {
      return 1;
    } else if (nameB.startsWith(nameA)) {
      return -1;
    } else {
      return nameA.localeCompare(nameB);
    }
  }

  generateId(): string {
    return randCustomString(numerals, 9);
  }

  unselectAll(): void {
    Object.values(this.nodeMap).forEach(node => node.isSelected = false);
  }

  create(id: string, password: string): void {
    this.id = id;
    this.password = password;
    this.setData(this.getNewData(this.id));
    this.router.navigate(['/browser']);
  }

  private getNewData(id: string): Data {
    const root = '/' + id;

    const data = new Data();
    data.root = this.getFolder(root);
    data.root.path = '/';

    const now: number = Date.now();
    data.meta = {
      id: id,
      encryptorVersion: META.version,
      updateVersion: 1,
      createdTimestamp: now,
      updatedTimestamp: now,
    };

    return data;
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

  decryptFile(file: File): void {
    if (file && !file.block.isDecrypted) {
      const start: number = file.block.position;
      const size: number = file.block.size;
      const encrypted: Uint8Array = this.blocks.slice(start, start + size);
      const decrypted: Uint8Array = this.cryptoService.decrypt(encrypted, this.password);
      file.block.binary = decrypted;
      file.block.isDecrypted = true;
    }
  }

  decryptAllFiles(modify: boolean = false): void {
    this.refresh(this.data.root);
    for (const node of Object.values(this.nodeMap)) {
      if (node instanceof File) {
        this.decryptFile(node);
        if (modify) {
          node.block.isModified = true;
        }
      }
    }
  }

  destroy(): void {
    this.isDecrypted = false;
    this.isModified = false;
    this.isFileModified = false;
    this.id = undefined;
    this.password = undefined;
    this.data = undefined;
    this.blocks = undefined;
    this.nodeMap = {};
    this.pathMap = {};
  }
}
