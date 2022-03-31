import { randstr64 } from 'rndmjs';

export class Node {
  name: string;
  path: string;
  id: string = randstr64(20);
  isSelected: boolean = false;
  isFolder: boolean = false;
  tags: string[] = [];
  size: number;
  sizeString: string;
  createdTimestamp: number;
  updatedTimestamp: number;
  index: number = 0;

  constructor() {
    const now = Date.now();
    this.createdTimestamp = now;
    this.updatedTimestamp = now;
  }
}

export class File extends Node {
  isBinary: boolean = false;
  text: string;
  block = new BinaryBlock();
}

export class Folder extends Node {
  nodes: Node[] = [];
  sortBy: string;

  constructor() {
    super();
    this.isFolder = true;
  }

  push(node: Node): Folder {
    this.nodes.push(node);
    return this;
  }
}

export interface Meta {
  id: string;
  createdTimestamp: number;
  updatedTimestamp: number;
  encryptorVersion: string; // E.g. '2.47'
  updateVersion: number; // E.g. 6438
}

export class Data {
  meta: Meta;
  root: Folder;
}

export class BinaryBlock {
  binary = new Uint8Array();
  position: number;
  size: number = 0;
  isDecrypted: boolean = true;
  isModified: boolean = true;

  constructor(binary?: Uint8Array, isDecrypted?: boolean) {
    if (binary) {
      this.binary = binary;
    }
    if (isDecrypted !== undefined) {
      this.isDecrypted = isDecrypted;
    }
  }

  copy(): BinaryBlock {
    const bb = new BinaryBlock();
    bb.binary = this.binary;
    bb.position = this.position;
    bb.size = this.size;
    bb.isDecrypted = this.isDecrypted;
    bb.isModified = this.isModified;
    return bb;
  }
}

export interface NodeMap {
  [id: string]: Node;
}

export interface StringMap {
  [id: string]: string;
}

export interface DialogData {
  message: string;
}

export interface Parse {
  name: string;
  parent: string;
  length: number;
  nodes: string[];
}

export class Grid {
  rows: GridRow[] = [];
}

export enum GridType {
  UNDEFINED = 0,
  TEXTBLOCK = 1,
  INPUT = 2,
  PASSWORD = 3,
  TEXTAREA = 4,
  HIDDENBLOCK = 5,
}

export class GridRow {
  label: string = '';
  value: string = '';
  type: GridType = GridType.INPUT;
  visibility: string = 'password';
}

export interface NodeInfo {
  size: number; // Amount of bytes
  files: number; // Total amount of files
  folders: number; // Total amount of folders
  depth: number; // Amount of folder on longest branch
}

export class SearchResult {
  node: Node;
  icon: string;
  rank: number = 0;
  isName: boolean = false;
  isContent: boolean = false;

  constructor(node: Node) {
    this.node = node;
  }
}
