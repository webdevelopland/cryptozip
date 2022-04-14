import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { Tree, Node, File, Folder, NodeMap, StringMap, Parse, BinaryBlock } from '@/core/type';
import { parsePath, getName, getRV } from '@/core/functions';
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
  rv: Uint8Array;
  tree: Tree;
  nodeMap: NodeMap = {};
  pathMap: StringMap = {};
  blocks: Uint8Array;
  dataChanges = new Subject<void>();
  fileChanges = new Subject<void>(); // Request to check "is file modified?"

  constructor(
    private router: Router,
    private cryptoService: CryptoService,
    private nodeService: NodeService,
  ) { }

  setTree(tree: Tree): void {
    this.tree = tree;
    this.nodeMap = {};
    this.pathMap = {};
    this.refresh(this.tree.root);
    this.nodeService.getNodeInfo(this.tree.root);
    this.id = tree.meta.id;
    this.dataChanges.next();
    this.isDecrypted = true;
  }

  modifyAndRefresh(): void {
    this.nodeMap = {};
    this.pathMap = {};
    this.refresh(this.tree.root);
    this.nodeService.getNodeInfo(this.tree.root);
    this.isModified = true;
  }

  modify(): void {
    this.isModified = true;
  }

  update(): void {
    if (this.isModified) {
      this.tree.meta.updateVersion++;
      const now = Date.now();
      this.tree.meta.updatedTimestamp = now;
      this.tree.root.updatedTimestamp = now;
      this.rv = getRV();
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
    this.refresh(this.tree.root);
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

  unselectAll(): void {
    Object.values(this.nodeMap).forEach(node => node.isSelected = false);
  }

  updateNode(node: Node): number {
    const now: number = Date.now();
    node.updatedTimestamp = now;
    if (node instanceof File && node.block.isDecrypted && !node.block.isModified) {
      node.block.isModified = true;
      node.block.updateKey();
      this.isModified = true;
    }
    return now;
  }

  create(id: string, password: string): void {
    this.id = id;
    this.password = password;
    this.rv = getRV();
    this.setTree(this.getNewTree(this.id));
    this.router.navigate(['/browser']);
  }

  private getNewTree(id: string): Tree {
    const root = '/' + id;

    const tree = new Tree();
    tree.root = this.getFolder(root);
    tree.root.path = '/';

    const now: number = Date.now();
    tree.meta = {
      id: id,
      encryptorVersion: META.version,
      updateVersion: 1,
      createdTimestamp: now,
      updatedTimestamp: now,
    };

    return tree;
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
      const encrypted: Uint8Array = this.getBlockBinary(file.block);
      if (encrypted.length > 0) {
        file.block.binary = this.cryptoService.encryptCTR(encrypted, file.block.key);
      }
      file.block.isDecrypted = true;
    }
  }

  decryptAllFiles(modify: boolean = false): void {
    let isModified: boolean = false;
    this.refresh(this.tree.root);
    for (const node of Object.values(this.nodeMap)) {
      if (node instanceof File) {
        this.decryptFile(node);
        if (modify && !node.block.isModified) {
          node.block.isModified = true;
          node.block.updateKey();
          isModified = true;
        }
      }
    }
    if (isModified) {
      this.isModified = true;
    }
  }

  getBlockBinary(block: BinaryBlock): Uint8Array {
    const size: number = block.size;
    if (size > 0) {
      const start: number = block.position;
      return this.blocks.slice(start, start + size);
    } else {
      return new Uint8Array();
    }
  }

  destroy(): void {
    this.isDecrypted = false;
    this.isModified = false;
    this.isFileModified = false;
    this.id = undefined;
    this.password = undefined;
    this.tree = undefined;
    this.blocks = undefined;
    this.nodeMap = {};
    this.pathMap = {};
  }
}
